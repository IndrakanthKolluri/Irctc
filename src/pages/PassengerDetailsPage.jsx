import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import PassengerMasterModal from '../components/PassengerMasterModal.jsx'
import PassengerRow from '../components/PassengerRow.jsx'
import { AuthContext } from '../context/authContext.js'
import { BookingContext } from '../context/bookingContext.js'
import { getData } from '../services/db.js'
import { getQuotaFare, getSegmentFare } from '../utils/fare.js'
import { getPassengerFareTotal, hasDuplicatePassengers } from '../utils/bookingDraft.js'
import { checkQuotaEligibility } from '../utils/quotaRules.js'
import { isValidEmail, isValidMobile, validatePassenger } from '../utils/validators.js'

// Collect and validate booking passengers, contact information, and final fare.
export default function PassengerDetailsPage() {
  const { user } = useContext(AuthContext)
  const { draft, setDraft } = useContext(BookingContext)
  const navigate = useNavigate()
  const [passengers, setPassengers] = useState(draft && draft.passengers ? draft.passengers : [])
  const [contact, setContact] = useState(draft && draft.contact ? draft.contact : { email: user.email, mobile: user.mobile })
  const [bookOnlyConfirmed, setBookOnlyConfirmed] = useState(Boolean(draft && draft.bookOnlyConfirmed))
  const [showMasterList, setShowMasterList] = useState(false)

  useEffect(() => {
    if (!draft || !draft.selection) {
      navigate('/user/home', { replace: true })
    }
  }, [draft, navigate])

  function updatePassenger(index, passenger) {
    const nextPassengers = passengers.slice()
    nextPassengers[index] = passenger
    setPassengers(nextPassengers)
  }

  function addPassenger(passenger) {
    if (passengers.length >= 6) {
      toast.error('A booking can include at most 6 passengers.')
      return
    }
    const nextPassenger = passenger
      ? { name: passenger.name, age: String(passenger.age), gender: passenger.gender, berthPref: passenger.berthPref || 'No Preference' }
      : { name: '', age: '', gender: 'Female', berthPref: 'No Preference' }
    setPassengers([...passengers, nextPassenger])
    setShowMasterList(false)
  }

  function removePassenger(index) {
    setPassengers(passengers.filter((_, passengerIndex) => passengerIndex !== index))
  }

  function continueToPayment(event) {
    event.preventDefault()
    if (passengers.length === 0 || passengers.length > 6) {
      toast.error('Add between 1 and 6 passengers.')
      return
    }
    for (const passenger of passengers) {
      const error = validatePassenger(passenger)
      if (error) {
        toast.error(error)
        return
      }
    }
    if (hasDuplicatePassengers(passengers)) {
      toast.error('The same passenger cannot be added twice.')
      return
    }
    const quotaError = checkQuotaEligibility(draft.selection.quota, passengers)
    if (quotaError) {
      toast.error(quotaError)
      return
    }
    if (!isValidEmail(contact.email) || !isValidMobile(contact.mobile)) {
      toast.error('Enter a valid contact email and mobile number.')
      return
    }
    const trains = getData('trains')
    const train = trains.find((item) => item.id === draft.selection.trainId)
    if (!train) {
      toast.error('The selected train is no longer available.')
      navigate('/user/home', { replace: true })
      return
    }
    const fare = getQuotaFare(
      getSegmentFare(train, draft.selection.from, draft.selection.to, draft.selection.classType),
      draft.selection.quota,
    )
    const amount = getPassengerFareTotal(passengers, fare)
    setDraft({ ...draft, passengers, contact, bookOnlyConfirmed, amount })
    navigate('/payment')
  }

  if (!draft || !draft.selection) {
    return null
  }

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Passenger details</h1>
        <p className="mt-1 text-slate-600">{draft.selection.from} → {draft.selection.to} · {draft.selection.date} · {draft.selection.classType} · {draft.selection.quota}</p>
      </div>
      <form onSubmit={continueToPayment} className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => addPassenger(null)} disabled={passengers.length >= 6}>Add passenger</Button>
          <Button onClick={() => setShowMasterList(true)}>Pick from Passenger Master List</Button>
        </div>
        {passengers.map((passenger, index) => (
          <PassengerRow key={`passenger-${index}`} passenger={passenger} index={index} onChange={updatePassenger} onRemove={removePassenger} />
        ))}
        {passengers.length === 0 && <p className="rounded-md bg-white p-4 text-sm text-slate-600">Add at least one passenger to continue.</p>}
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-xl font-semibold">Contact details</h2>
          <Input id="contact-email" label="Email" type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} required />
          <Input id="contact-mobile" label="Mobile" type="tel" value={contact.mobile} onChange={(event) => setContact({ ...contact, mobile: event.target.value })} required />
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={bookOnlyConfirmed} onChange={(event) => setBookOnlyConfirmed(event.target.checked)} />
            <span><strong>Book only if confirmed</strong><br />If seats are no longer available at payment time, do not create a waitlist booking.</span>
          </label>
          <p className="mt-4 text-xl font-bold">Estimated fare: ₹{getPassengerFareTotal(passengers, draft.selection.fare || 0)}</p>
          <p className="text-sm text-slate-600">Children under 5 are free and do not receive a seat.</p>
        </section>
        <Button type="submit">Continue to payment</Button>
      </form>
      {showMasterList && (
        <PassengerMasterModal
          passengers={user.passengers || []}
          onSelect={addPassenger}
          onClose={() => setShowMasterList(false)}
        />
      )}
    </main>
  )
}
