import { useEffect, useState } from 'react'
import BookingTable from '../components/BookingTable.jsx'
import StationPanel from '../components/StationPanel.jsx'
import TrainPanel from '../components/TrainPanel.jsx'
import { getAdminData } from '../services/trainService.js'

// Load management data and refresh it after this tab or another tab saves.
export default function AdminPage() {
  const [adminData, setAdminData] = useState(() => getAdminData())

  function refreshData() {
    setAdminData(getAdminData())
  }

  useEffect(() => {
    function handleStorageChange(event) {
      if (!event.key || ['stations', 'trains', 'bookings'].includes(event.key)) {
        refreshData()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:py-12">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Management console</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Admin dashboard</h1>
        <p className="mt-2 text-slate-600">Manage stations, train routes, capacities, bookings, and waitlists.</p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <StationPanel stations={adminData.stations} onChanged={refreshData} />
        <TrainPanel trains={adminData.trains} stations={adminData.stations} onChanged={refreshData} />
      </div>
      <BookingTable bookings={adminData.bookings} trains={adminData.trains} />
    </main>
  )
}
