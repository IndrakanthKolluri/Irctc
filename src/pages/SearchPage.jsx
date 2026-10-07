import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import TrainResultCard from '../components/TrainResultCard.jsx'
import { BookingContext } from '../context/bookingContext.js'
import { searchTrains } from '../services/trainService.js'

// Display matching trains and refresh their availability when bookings change.
export default function SearchPage() {
  const { draft, setDraft } = useContext(BookingContext)
  const navigate = useNavigate()
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [classFilter, setClassFilter] = useState('All')
  const [sortDeparture, setSortDeparture] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    if (!draft || !draft.search) {
      navigate('/user/home', { replace: true })
      return
    }
    const timer = window.setTimeout(() => {
      setTrains(searchTrains(draft.search.from, draft.search.to))
      setLoading(false)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [draft, navigate, refreshCount])

  useEffect(() => {
    function handleStorage(event) {
      if (!event.key || event.key === 'bookings') {
        setRefreshCount((count) => count + 1)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  function selectTrain(selection) {
    setDraft({
      ...draft,
      selection: {
        trainId: selection.train.id,
        classType: selection.classType,
        quota: selection.quota,
        fare: selection.fare,
        from: draft.search.from,
        to: draft.search.to,
        date: draft.search.date,
      },
    })
    navigate('/passengers')
  }

  let visibleTrains = trains.slice()
  if (sortDeparture) {
    visibleTrains.sort((first, second) => {
      const firstTime = first.stops.find((stop) => stop.stationCode === draft.search.from).time
      const secondTime = second.stops.find((stop) => stop.stationCode === draft.search.from).time
      return firstTime.localeCompare(secondTime)
    })
  }

  if (!draft || !draft.search) {
    return null
  }

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Trains on this route</h1>
          <p className="mt-1 text-slate-600">{draft.search.from} → {draft.search.to} · {draft.search.date}</p>
          <p className="mt-1 text-sm text-slate-500">Trains that do not run on your selected weekday are shown faded and cannot be selected.</p>
        </div>
        <Button onClick={() => navigate('/user/home')}>Change search</Button>
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-md bg-white p-4">
        <label className="text-sm font-medium">Class filter
          <select className="ml-2 rounded-md border p-2" value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
            <option>All</option><option>SL</option><option>3A</option><option>2A</option><option>1A</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={sortDeparture} onChange={(event) => setSortDeparture(event.target.checked)} />
          Sort by departure time
        </label>
      </div>
      {loading ? (
        <div className="space-y-3" aria-label="Loading trains">
          <p className="text-slate-600">Loading trains…</p>
          <div className="h-32 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-200" />
        </div>
      ) : visibleTrains.length === 0 ? (
        <section className="rounded-lg border bg-white p-8 text-center">
          <h2 className="text-xl font-semibold">No trains found</h2>
          <p className="mt-2 text-slate-600">Try another route, date, or class filter.</p>
        </section>
      ) : (
        <div className="space-y-4">
          {visibleTrains.map((train) => <TrainResultCard key={train.id} train={train} search={draft.search} onSelect={selectTrain} classFilter={classFilter} />)}
        </div>
      )}
    </main>
  )
}
