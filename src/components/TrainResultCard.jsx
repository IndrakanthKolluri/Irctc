import { useState } from 'react'
import { toast } from 'react-toastify'
import Button from './Button.jsx'
import { getData } from '../services/db.js'
import { getAvailability } from '../utils/availability.js'
import { getQuotaFare, getSegmentFare } from '../utils/fare.js'

const quotaOptions = ['General', 'Tatkal', 'Ladies', 'Senior Citizen']
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Show route times and let a passenger choose class and quota to book.
export default function TrainResultCard({ train, search, onSelect, classFilter }) {
  const [quota, setQuota] = useState('General')
  const bookings = getData('bookings')
  const fromStop = train.stops.find((stop) => stop.stationCode === search.from)
  const toStop = train.stops.find((stop) => stop.stationCode === search.to)
  const selectedDay = new Date(`${search.date}T00:00:00`).getDay()
  const runsOnSelectedDay = Array.isArray(train.runningDays) && train.runningDays.includes(selectedDay)

  function chooseClass(classType) {
    if (!runsOnSelectedDay) {
      return
    }
    const fare = getQuotaFare(getSegmentFare(train, search.from, search.to, classType), quota)
    const availability = getAvailability(train, bookings, search.date, classType)
    if (availability.status === 'REGRET') {
      toast.error('This class has no available seats or waitlist spaces.')
      return
    }
    onSelect({ train, classType, quota, fare })
  }

  return (
    <article className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-900/[0.04] transition sm:p-6 ${
      runsOnSelectedDay
        ? 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/[0.07]'
        : 'opacity-55 grayscale-[0.35]'
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-950">{train.name}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Train {train.number}</p>
          <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
            runsOnSelectedDay ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {runsOnSelectedDay ? `Runs ${weekdayNames[selectedDay]}` : `Does not run ${weekdayNames[selectedDay]}`}
          </p>
        </div>
        <label className="text-sm font-medium">Quota
          <select className="mt-2 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={quota} onChange={(event) => setQuota(event.target.value)}>
            {quotaOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="my-5 grid grid-cols-2 gap-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/70 p-4">
        <div><p className="text-2xl font-bold tracking-tight text-slate-950">{fromStop.time}</p><p className="mt-1 text-sm text-slate-600">{search.from} · Departure</p></div>
        <div><p className="text-2xl font-bold tracking-tight text-slate-950">{toStop.time}</p><p className="mt-1 text-sm text-slate-600">{search.to} · Arrival</p></div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {train.classes.filter((item) => classFilter === 'All' || item.type === classFilter).map((trainClass) => {
          const fare = getQuotaFare(getSegmentFare(train, search.from, search.to, trainClass.type), quota)
          const availability = getAvailability(train, bookings, search.date, trainClass.type)
          return (
            <div key={trainClass.type} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40">
              <div>
                <strong>{trainClass.type}</strong>
                <p className="text-sm">
                  {runsOnSelectedDay ? `₹${fare} · ${availability.status}` : `₹${fare} · Not running`}
                </p>
              </div>
              <Button
                onClick={() => chooseClass(trainClass.type)}
                disabled={!runsOnSelectedDay}
                className="px-3 py-1.5 text-sm"
              >
                {runsOnSelectedDay ? 'Select' : 'Not running'}
              </Button>
            </div>
          )
        })}
      </div>
    </article>
  )
}
