// Display saved booking records for administrative review.
export default function BookingTable({ bookings, trains }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-xl font-semibold">All bookings</h2>
      {bookings.length === 0 ? (
        <p className="py-4 text-sm text-slate-600">No bookings have been made yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b text-slate-600">
                <th className="p-2">PNR</th><th className="p-2">Train</th><th className="p-2">Route</th>
                <th className="p-2">Date</th><th className="p-2">Class / quota</th><th className="p-2">Passengers</th><th className="p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.pnr} className="border-b">
                  <td className="p-2 font-medium">{booking.pnr}</td>
                  <td className="p-2">{(trains || []).find((train) => train.id === booking.trainId)?.number || booking.trainId}</td>
                  <td className="p-2">{booking.from} → {booking.to}</td>
                  <td className="p-2">{booking.date}</td>
                  <td className="p-2">{booking.classType} / {booking.quota}</td>
                  <td className="p-2">{(booking.passengers || []).map((passenger) => `${passenger.name} (${passenger.status})`).join(', ')}</td>
                  <td className="p-2">₹{booking.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
