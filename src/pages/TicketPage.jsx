import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TicketDetails from '../components/TicketDetails.jsx'
import { AuthContext } from '../context/authContext.js'
import { getBookingByPnr } from '../services/bookingService.js'

// Look up a ticket by PNR and refresh it when another tab changes bookings.
export default function TicketPage() {
  const { pnr } = useParams()
  const { user } = useContext(AuthContext)
  const [details, setDetails] = useState(() => getBookingByPnr(pnr))

  function refreshTicket() {
    setDetails(getBookingByPnr(pnr))
  }

  useEffect(() => {
    function handleStorage(event) {
      if (!event.key || event.key === 'bookings') {
        setDetails(getBookingByPnr(pnr))
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [pnr])

  if (!details) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Ticket not found</h1>
        <p className="mt-2 text-slate-600">Check the PNR and try again.</p>
        <Link className="mt-5 inline-block text-blue-800 underline" to="/pnr">Check another PNR</Link>
      </main>
    )
  }

  return (
    <main className="px-4 py-10">
      <TicketDetails details={details} user={user} onChanged={refreshTicket} />
    </main>
  )
}
