import { Link } from 'react-router-dom'

// Show a concise booking summary that opens the ticket by its PNR.
export default function BookingList({ bookings, trains }) {
  if (bookings.length === 0) {
    return <p className="rounded-lg border bg-white p-6 text-slate-600">No bookings in this tab.</p>
  }
  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const train = trains.find((item) => item.id === booking.trainId)
        return (
          <Link key={booking.pnr} to={`/ticket/${booking.pnr}`} className="block rounded-lg border bg-white p-5 hover:border-blue-700">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="font-bold">{train ? `${train.number} · ${train.name}` : booking.trainId}</h2>
                <p className="mt-1">{booking.from} → {booking.to} · {booking.date}</p>
              </div>
              <div className="text-right"><p className="font-semibold">{booking.status}</p><p className="text-sm text-slate-600">PNR {booking.pnr}</p></div>
            </div>
            <p className="mt-3 text-sm text-slate-600">{(booking.passengers || []).map((passenger) => `${passenger.name}: ${passenger.status}`).join(' · ')}</p>
          </Link>
        )
      })}
    </div>
  )
}
