import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../components/Button.jsx'
import PaymentMethodFields from '../components/PaymentMethodFields.jsx'
import PaymentResult from '../components/PaymentResult.jsx'
import { AuthContext } from '../context/authContext.js'
import { BookingContext } from '../context/bookingContext.js'
import { createBooking } from '../services/bookingService.js'

const paymentWindow = 10 * 60 * 1000

// Display remaining payment time in a readable minutes-and-seconds format.
function formatCountdown(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

// Check required fields for the selected mock payment method.
function validatePayment(method, savedPayment, newCard, newUpi) {
  if (['Saved Card', 'Saved UPI', 'Net Banking'].includes(method) && !savedPayment) {
    return 'Choose a saved payment option or bank.'
  }
  if (method === 'New Card') {
    const digits = newCard.number.replace(/\D/g, '')
    if (digits.length < 12 || digits.length > 19 || !newCard.holder.trim()
      || !/^\d{2}\/\d{2}$/.test(newCard.expiry) || !/^\d{3,4}$/.test(newCard.cvv)) {
      return 'Enter valid card details to continue.'
    }
  }
  if (method === 'UPI' && !/^[A-Za-z0-9._-]+@[A-Za-z][A-Za-z0-9]{1,19}$/.test(newUpi.trim())) {
    return 'Enter a valid UPI ID, such as name@bank.'
  }
  return ''
}

// Show payment, countdown, and the atomic booking result after payment.
export default function PaymentPage() {
  const { user } = useContext(AuthContext)
  const { draft, setDraft } = useContext(BookingContext)
  const navigate = useNavigate()
  const [method, setMethod] = useState('UPI')
  const [savedPayment, setSavedPayment] = useState('')
  const [newCard, setNewCard] = useState({ number: '', holder: '', expiry: '', cvv: '' })
  const [newUpi, setNewUpi] = useState('')
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState(draft && draft.paymentResult ? draft.paymentResult : null)
  const [remainingSeconds, setRemainingSeconds] = useState(600)

  useEffect(() => {
    if (!draft || !draft.selection || !draft.passengers || !draft.contact) {
      navigate('/user/home', { replace: true })
      return
    }
    if (!draft.paymentExpiresAt && !draft.paymentResult) {
      setDraft({ ...draft, paymentExpiresAt: Date.now() + paymentWindow })
    }
  }, [draft, navigate, setDraft])

  useEffect(() => {
    if (!draft || !draft.paymentExpiresAt || draft.paymentResult) {
      return undefined
    }
    function updateTime() {
      const seconds = Math.max(0, Math.ceil((draft.paymentExpiresAt - Date.now()) / 1000))
      setRemainingSeconds(seconds)
      if (seconds === 0) {
        toast.error('Payment time expired. Please start again.')
        setDraft(draft.search ? { search: draft.search } : null)
        navigate(draft.search ? '/search' : '/user/home', { replace: true })
      }
    }
    updateTime()
    const timerId = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(timerId)
  }, [draft, navigate, setDraft])

  function returnToSearch() {
    setDraft(draft.search ? { search: draft.search } : null)
    navigate(draft.search ? '/search' : '/user/home', { replace: true })
  }

  function pay() {
    if (processing || result) {
      return
    }
    const validationError = validatePayment(method, savedPayment, newCard, newUpi)
    if (validationError) {
      toast.error(validationError)
      return
    }
    setProcessing(true)
    setErrorMessage('')
    window.setTimeout(() => finishPayment(), 700)
  }

  function finishPayment() {
    if (Date.now() >= draft.paymentExpiresAt) {
      toast.error('Payment time expired. Please start again.')
      returnToSearch()
      setProcessing(false)
      return
    }
    if (simulateFailure) {
      setErrorMessage('Payment failed. No booking was created. You can retry with another method.')
      setProcessing(false)
      return
    }
    try {
      const bookingResult = createBooking({
        ...draft.selection,
        userId: user.id,
        passengers: draft.passengers,
        amount: draft.amount,
        bookOnlyConfirmed: draft.bookOnlyConfirmed,
      })
      setResult(bookingResult)
      setDraft({ ...draft, paymentResult: bookingResult })
      if (bookingResult.created) {
        toast.success('Payment successful and booking created.')
      } else {
        toast.error(bookingResult.reason)
      }
    } catch (error) {
      setErrorMessage(error.message)
      toast.error(error.message)
    } finally {
      setProcessing(false)
    }
  }

  if (!draft || !draft.selection) {
    return null
  }

  if (result) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <PaymentResult result={result} draft={draft} onSearch={returnToSearch} />
      </main>
    )
  }

  const savedCards = user.savedCards || []
  const savedUpiIds = user.upiIds || []
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Payment</h1>
      <p className="mt-2 text-lg">Complete payment within <strong>{formatCountdown(remainingSeconds)}</strong></p>
      <section className="mt-5 rounded-lg border bg-white p-5">
        <h2 className="text-xl font-semibold">Fare summary</h2>
        <p className="mt-2">{draft.selection.from} → {draft.selection.to} · {draft.selection.date}</p>
        <p className="mt-1">{draft.passengers.length} passenger(s) · {draft.selection.classType} · {draft.selection.quota}</p>
        <p className="mt-3 text-2xl font-bold">₹{draft.amount}</p>
      </section>
      <section className="mt-5 rounded-lg border bg-white p-5">
        <PaymentMethodFields
          method={method}
          setMethod={setMethod}
          savedPayment={savedPayment}
          setSavedPayment={setSavedPayment}
          savedCards={savedCards}
          savedUpiIds={savedUpiIds}
          newCard={newCard}
          setNewCard={setNewCard}
          newUpi={newUpi}
          setNewUpi={setNewUpi}
        />
        <label className="my-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={simulateFailure} onChange={(event) => setSimulateFailure(event.target.checked)} />
          Simulate failure
        </label>
        {errorMessage && <p role="alert" className="mb-3 text-sm text-red-700">{errorMessage}</p>}
        <Button onClick={pay} disabled={processing || Boolean(result)} className="w-full">
          {processing ? 'Processing payment…' : 'Pay securely'}
        </Button>
      </section>
    </main>
  )
}
