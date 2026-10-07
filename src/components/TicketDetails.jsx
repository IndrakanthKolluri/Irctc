import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from './Button.jsx'
import CancellationModal from './CancellationModal.jsx'

// Display full ticket information and owner-only cancellation controls.
export default function TicketDetails({ details, user, onChanged }) {
  const [showCancellation, setShowCancellation] = useState(false)
  const { booking, train, fromStation, toStation } = details
  const canCancel = user && user.id === booking.userId
  const departure = train && train.stops.find((stop) => stop.stationCode === booking.from)
  const arrival = train && train.stops.find((stop) => stop.stationCode === booking.to)

  function handleCancelled() {
    setShowCancellation(false)
    onChanged()
  }

  function printTicket() {
    try {
      window.print()
    } catch (error) {
      console.error('Could not open the browser print dialog.', error)
      toast.error('The ticket could not be opened for printing.')
    }
  }

  return (
    <article className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
        <div>
          <p className="font-semibold uppercase tracking-wide text-blue-800">IRCTC e-ticket</p>
          <h1 className="mt-1 text-2xl font-bold">{train ? train.name : `Train ${booking.trainId}`}</h1>
          <p className="text-slate-600">Train number {train ? train.number : booking.trainId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">PNR</p>
          <p className="text-xl font-bold">{booking.pnr}</p>
          <p className="mt-1">{booking.status}</p>
        </div>
      </div>
      <div className="grid gap-4 border-b py-5 sm:grid-cols-3">
        <div><p className="text-sm text-slate-500">From</p><p className="font-semibold">{fromStation ? `${fromStation.name} (${booking.from})` : booking.from}</p><p>{departure ? departure.time : 'Time unavailable'}</p></div>
        <div><p className="text-sm text-slate-500">To</p><p className="font-semibold">{toStation ? `${toStation.name} (${booking.to})` : booking.to}</p><p>{arrival ? arrival.time : 'Time unavailable'}</p></div>
        <div><p className="text-sm text-slate-500">Journey date</p><p className="font-semibold">{booking.date}</p></div>
      </div>
      <div className="grid gap-2 border-b py-4 sm:grid-cols-3">
        <p>Class: <strong>{booking.classType}</strong></p>
        <p>Quota: <strong>{booking.quota}</strong></p>
        <p>Transaction: <strong>{booking.transactionId}</strong></p>
        <p>Amount: <strong>₹{booking.amount}</strong></p>
        <p>Refund: <strong>₹{booking.refund || 0}</strong></p>
      </div>
      <div className="overflow-x-auto py-5">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead><tr className="border-b text-slate-500"><th className="p-2">Passenger</th><th className="p-2">Age</th><th className="p-2">Gender</th><th className="p-2">Status</th><th className="p-2">Seat / WL</th></tr></thead>
          <tbody>
            {(booking.passengers || []).map((passenger, index) => (
              <tr key={`${passenger.name}-${index}`} className="border-b">
                <td className="p-2">{passenger.name}</td><td className="p-2">{passenger.age}</td><td className="p-2">{passenger.gender}</td>
                <td className="p-2">{passenger.status}</td>
                <td className="p-2">{passenger.seat || (passenger.wlNumber ? `WL ${passenger.wlNumber}` : Number(passenger.age) < 5 ? 'No seat required' : '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 print:hidden">
        <Button onClick={printTicket}>Print ticket</Button>
        <Link className="rounded-md border border-blue-800 px-4 py-2 text-blue-800" to="/pnr">Check another PNR</Link>
        {canCancel && booking.status !== 'CANCELLED' && <Button onClick={() => setShowCancellation(true)} className="bg-red-700 hover:bg-red-800">Cancel ticket</Button>}
      </div>
      {showCancellation && (
        <CancellationModal booking={booking} onClose={() => setShowCancellation(false)} onCancelled={handleCancelled} />
      )}
    </article>
  )
}
