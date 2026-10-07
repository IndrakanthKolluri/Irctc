import { useState } from 'react'
import { toast } from 'react-toastify'
import Button from './Button.jsx'
import Modal from './Modal.jsx'
import { cancelPassengers, previewCancellation } from '../services/bookingService.js'

// Let a ticket owner choose passengers and confirm their cancellation refund.
export default function CancellationModal({ booking, onClose, onCancelled }) {
  const [selectedIndexes, setSelectedIndexes] = useState([])
  const [refundPreview, setRefundPreview] = useState(null)
  const [processing, setProcessing] = useState(false)

  function togglePassenger(index) {
    setRefundPreview(null)
    if (selectedIndexes.includes(index)) {
      setSelectedIndexes(selectedIndexes.filter((item) => item !== index))
    } else {
      setSelectedIndexes([...selectedIndexes, index])
    }
  }

  function reviewRefund() {
    try {
      setRefundPreview(previewCancellation(booking.pnr, selectedIndexes))
    } catch (error) {
      toast.error(error.message)
    }
  }

  function selectWholeTicket() {
    const remainingIndexes = []
    for (let index = 0; index < (booking.passengers || []).length; index += 1) {
      if (booking.passengers[index].status !== 'CANCELLED') {
        remainingIndexes.push(index)
      }
    }
    setSelectedIndexes(remainingIndexes)
    setRefundPreview(null)
  }

  function confirmCancellation() {
    if (processing || refundPreview === null) {
      return
    }
    setProcessing(true)
    try {
      const result = cancelPassengers(booking.pnr, selectedIndexes)
      toast.success(`Cancellation complete. Refund: ₹${result.refund}`)
      onCancelled(result.booking)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal title="Cancel ticket" onClose={onClose}>
      <p className="mb-3 text-sm text-slate-600">Select the passengers to cancel. Waitlisted passengers are refunded at 100%, less the ₹20 fee.</p>
      <div className="space-y-2">
        {(booking.passengers || []).map((passenger, index) => (
          <label key={`${passenger.name}-${index}`} className="flex items-center gap-3 rounded-md border p-3">
            <input
              type="checkbox"
              disabled={passenger.status === 'CANCELLED'}
              checked={selectedIndexes.includes(index)}
              onChange={() => togglePassenger(index)}
            />
            <span>{passenger.name} · {passenger.status}{passenger.seat ? ` · ${passenger.seat}` : ''}</span>
          </label>
        ))}
      </div>
      <button type="button" onClick={selectWholeTicket} className="mt-3 text-sm text-blue-800 underline">
        Select all remaining passengers (whole ticket)
      </button>
      {refundPreview !== null && (
        <p className="mt-4 rounded-md bg-amber-50 p-3 font-semibold">Refund before confirming: ₹{refundPreview}</p>
      )}
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button onClick={onClose} className="bg-slate-600 hover:bg-slate-700">Keep ticket</Button>
        {refundPreview === null ? (
          <Button onClick={reviewRefund}>Review refund</Button>
        ) : (
          <Button onClick={confirmCancellation} disabled={processing}>
            {processing ? 'Cancelling…' : 'Confirm cancellation'}
          </Button>
        )}
      </div>
    </Modal>
  )
}
