import { useState } from 'react'
import { toast } from 'react-toastify'
import Button from './Button.jsx'
import Input from './Input.jsx'
import TrainFormModal from './TrainFormModal.jsx'
import { deleteTrain, settleWaitlist } from '../services/trainService.js'

// Manage trains and let an admin settle a selected date's waitlist.
export default function TrainPanel({ trains, stations, onChanged }) {
  const [editingTrain, setEditingTrain] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [settleTrainId, setSettleTrainId] = useState('')
  const [settleDate, setSettleDate] = useState('')
  const [settling, setSettling] = useState(false)

  function removeTrain(train) {
    if (!window.confirm(`Delete train ${train.number} - ${train.name}?`)) {
      return
    }
    try {
      deleteTrain(train.id)
      onChanged()
      toast.success('Train deleted.')
    } catch (error) {
      toast.error(error.message)
    }
  }

  function settle() {
    if (settling) {
      return
    }
    setSettling(true)
    try {
      const promoted = settleWaitlist(settleTrainId, settleDate)
      onChanged()
      toast.success(`${promoted} waitlisted passenger${promoted === 1 ? '' : 's'} promoted.`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSettling(false)
    }
  }

  function openNewTrain() {
    if (stations.length < 2) {
      toast.error('Add at least two stations before creating a train.')
      return
    }
    setEditingTrain(null)
    setShowForm(true)
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-900/[0.04] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Trains</h2>
        <Button onClick={openNewTrain}>Add train</Button>
      </div>
      <div className="space-y-2">
        {trains.map((train) => (
          <div key={train.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 py-3">
            <span><strong>{train.number}</strong> · {train.name}</span>
            <span className="flex gap-3">
              <button className="text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900" onClick={() => { setEditingTrain(train); setShowForm(true) }}>Edit</button>
              <button className="text-sm font-semibold text-red-600 underline decoration-red-200 underline-offset-4 hover:text-red-800" onClick={() => removeTrain(train)}>Delete</button>
            </span>
          </div>
        ))}
        {trains.length === 0 && <p className="py-4 text-sm text-slate-600">No trains yet.</p>}
      </div>
      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <h3 className="mb-3 font-bold text-slate-900">Settle waitlist</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="mb-4 block text-sm font-medium text-slate-700">Train
            <select className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2" value={settleTrainId} onChange={(event) => setSettleTrainId(event.target.value)}>
              <option value="">Choose train</option>
              {trains.map((train) => <option key={train.id} value={train.id}>{train.number} · {train.name}</option>)}
            </select>
          </label>
          <Input id="settle-date" label="Travel date" type="date" value={settleDate} onChange={(event) => setSettleDate(event.target.value)} required />
        </div>
        <Button onClick={settle} disabled={settling}>{settling ? 'Settling…' : 'Settle waitlist'}</Button>
      </div>
      {showForm && (
        <TrainFormModal
          train={editingTrain}
          stations={stations}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); onChanged() }}
        />
      )}
    </section>
  )
}
