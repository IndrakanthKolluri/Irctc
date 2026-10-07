import Button from './Button.jsx'
import { Link } from 'react-router-dom'

// Show the persisted PNR, passenger status, or refund outcome after payment.
export default function PaymentResult({ result, draft, onSearch }) {
  if (result.refunded) {
    return (
      <section className="rounded-lg border border-amber-300 bg-white p-6">
        <h1 className="text-2xl font-bold">Payment refunded</h1>
        <p className="mt-3">{result.reason} No booking was created.</p>
        <p className="mt-2">Refund amount: ₹{draft.amount}</p>
        <Button onClick={onSearch} className="mt-5">Search trains</Button>
      </section>
    )
  }

  const booking = result.booking
  return (
    <section className="rounded-lg border border-green-200 bg-white p-6">
      <p className="font-semibold text-green-800">Payment successful</p>
      <h1 className="mt-2 text-3xl font-bold">Booking created</h1>
      <p className="mt-3">PNR: <strong>{booking.pnr}</strong></p>
      <p>Train: {booking.trainId} · {booking.from} → {booking.to}</p>
      <p>Travel date: {booking.date} · {booking.classType} · {booking.quota}</p>
      <p>Transaction ID: {booking.transactionId}</p>
      <div className="mt-4 border-t pt-3">
        {booking.passengers.map((passenger, index) => (
          <p key={`${passenger.name}-${index}`}>{passenger.name} — {passenger.status}{passenger.seat ? ` · ${passenger.seat}` : passenger.wlNumber ? ` · WL ${passenger.wlNumber}` : ' · no seat required'}</p>
        ))}
      </div>
      <p className="mt-4 font-bold">Paid: ₹{booking.amount}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link className="rounded-md bg-blue-800 px-4 py-2 font-medium text-white" to={`/ticket/${booking.pnr}`}>View ticket</Link>
        <Link className="rounded-md border border-blue-800 px-4 py-2 text-blue-800" to="/my-bookings">My bookings</Link>
      </div>
    </section>
  )
}
