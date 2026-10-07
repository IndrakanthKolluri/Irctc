import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../components/Button.jsx'
import { AuthContext } from '../context/authContext.js'
import { BookingContext } from '../context/bookingContext.js'
import { getData } from '../services/db.js'
import { isValidFutureDate } from '../utils/validators.js'

// Let signed-in passengers choose a route and travel date to search.
export default function HomePage({ userHome = false }) {
  const { user } = useContext(AuthContext)
  const { setDraft } = useContext(BookingContext)
  const navigate = useNavigate()
  const stations = getData('stations')
  const [search, setSearch] = useState({ from: '', to: '', date: '' })

  function submitSearch(event) {
    event.preventDefault()
    if (!search.from || !search.to || search.from === search.to) {
      toast.error('Choose different source and destination stations.')
      return
    }
    if (!isValidFutureDate(search.date)) {
      toast.error('Choose a valid travel date today or later.')
      return
    }
    setDraft({ search: { ...search } })
    navigate('/search')
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-10 text-white shadow-2xl shadow-blue-950/15 sm:px-10 sm:py-14 lg:px-14">
        <div className="pointer-events-none absolute -right-20 -top-32 -z-10 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 left-1/3 -z-10 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            IRCTC booking
          </p>
          <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Your next journey starts here.</h1>
          <p className="max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">Find the right train, check seats, and keep every part of your booking journey in one place.</p>
        </div>
        {!user ? (
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-950 shadow-lg shadow-slate-950/10 hover:-translate-y-0.5 hover:bg-sky-50" to="/login">User login</Link>
            <Link className="rounded-xl border border-white/30 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/15" to="/signup">Create account</Link>
            <Link className="rounded-xl px-4 py-3 font-semibold text-blue-950 bg-white hover:bg-white/10 hover:text-white" to="/admin-login">Admin login</Link>
          </div>
        ) : user.role === 'admin' ? (
          <Link className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-blue-950 shadow-lg hover:-translate-y-0.5 hover:bg-sky-50" to="/admin">Open admin dashboard</Link>
        ) : userHome ? (
          <form onSubmit={submitSearch} className="mt-9 grid gap-4 rounded-2xl border border-white/60 bg-white p-4 text-slate-900 shadow-2xl shadow-slate-950/20 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            <label className="text-sm font-semibold text-slate-700">From
              <select className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={search.from} onChange={(event) => setSearch({ ...search, from: event.target.value })} required>
                <option value="">Choose station</option>
                {stations.map((station) => <option key={station.id} value={station.code}>{station.code} · {station.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">To
              <select className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={search.to} onChange={(event) => setSearch({ ...search, to: event.target.value })} required>
                <option value="">Choose station</option>
                {stations.map((station) => <option key={station.id} value={station.code}>{station.code} · {station.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Journey date
              <input className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type="date" min={new Date().toLocaleDateString('en-CA')} value={search.date} onChange={(event) => setSearch({ ...search, date: event.target.value })} required />
            </label>
            <div className="flex items-end"><Button type="submit" className="w-full py-3">Search trains</Button></div>
          </form>
        ) : (
          <Link className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-blue-950 shadow-lg hover:-translate-y-0.5 hover:bg-sky-50" to="/user/home">Open booking home</Link>
        )}
      </section>
      {userHome && user && user.role === 'user' && <p className="mt-5 text-sm text-slate-600">Signed in as <strong className="text-slate-800">{user.name}</strong>. Manage saved details in <Link className="font-semibold text-blue-700 underline decoration-blue-300 underline-offset-4" to="/profile">My Profile</Link>.</p>}
    </main>
  )
}
