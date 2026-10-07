import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/authContext.js'
import BookingList from '../components/BookingList.jsx'
import { getData } from '../services/db.js'
import { getUserBookings } from '../services/bookingService.js'

// List the current user's future and cancelled tickets in separate tabs.
export default function MyBookingsPage() {
  const { user } = useContext(AuthContext)
  const [tab, setTab] = useState('Upcoming')
  const [bookings, setBookings] = useState(() => getUserBookings(user.id))
  const [trains, setTrains] = useState(() => getData('trains'))

  useEffect(() => {
    function handleStorage(event) {
      if (!event.key || event.key === 'bookings' || event.key === 'trains') {
        setBookings(getUserBookings(user.id))
        setTrains(getData('trains'))
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [user.id])

  const upcoming = bookings.filter((booking) => booking.status !== 'CANCELLED')
  const cancelled = bookings.filter((booking) => booking.status === 'CANCELLED')
  const visibleBookings = tab === 'Upcoming' ? upcoming : cancelled

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-10">
      <h1 className="text-3xl font-bold">My Bookings</h1>
      <div className="flex gap-2 border-b">
        {['Upcoming', 'Cancelled'].map((name) => (
          <button
            key={name}
            className={`border-b-2 px-4 py-3 font-medium ${tab === name ? 'border-blue-800 text-blue-800' : 'border-transparent text-slate-600'}`}
            onClick={() => setTab(name)}
          >
            {name} ({name === 'Upcoming' ? upcoming.length : cancelled.length})
          </button>
        ))}
      </div>
      <BookingList bookings={visibleBookings} trains={trains} />
    </main>
  )
}
