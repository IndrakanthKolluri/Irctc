import { useState } from 'react'
import { toast } from 'react-toastify'
import Button from './Button.jsx'
import Input from './Input.jsx'
import Modal from './Modal.jsx'
import { deleteStation, saveStation } from '../services/trainService.js'

// Let the administrator add, edit, and safely remove route stations.
export default function StationPanel({ stations, onChanged }) {
  const [draft, setDraft] = useState({ code: '', name: '', city: '' })
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)

  function openForm(station) {
    setEditingId(station ? station.id : '')
    setDraft(station ? { code: station.code, name: station.name, city: station.city } : { code: '', name: '', city: '' })
    setShowForm(true)
  }

  function submitStation(event) {
    event.preventDefault()
    try {
      saveStation(draft, editingId)
      setShowForm(false)
      onChanged()
      toast.success(editingId ? 'Station updated.' : 'Station added.')
    } catch (error) {
      toast.error(error.message)
    }
  }

  function removeStation(station) {
    if (!window.confirm(`Delete ${station.name} (${station.code})?`)) {
      return
    }
    try {
      deleteStation(station.id)
      onChanged()
      toast.success('Station deleted.')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-900/[0.04] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Stations</h2>
        <Button onClick={() => openForm(null)}>Add station</Button>
      </div>
      <div className="space-y-2">
        {stations.map((station) => (
          <div key={station.id} className="flex items-center justify-between gap-2 border-t border-slate-100 py-3">
            <span className="min-w-0">
              <strong>{station.code}</strong> · {station.name}, {station.city}
            </span>
            <span className="flex shrink-0 gap-3">
              <button className="text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900" onClick={() => openForm(station)}>Edit</button>
              <button className="text-sm font-semibold text-red-600 underline decoration-red-200 underline-offset-4 hover:text-red-800" onClick={() => removeStation(station)}>Delete</button>
            </span>
          </div>
        ))}
        {stations.length === 0 && <p className="py-4 text-sm text-slate-600">No stations yet.</p>}
      </div>
      {showForm && (
        <Modal title={editingId ? 'Edit station' : 'Add station'} onClose={() => setShowForm(false)}>
          <form onSubmit={submitStation}>
            <Input id="station-code" label="Station code" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} required />
            <Input id="station-name" label="Station name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
            <Input id="station-city" label="City" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} required />
            <Button type="submit">Save station</Button>
          </form>
        </Modal>
      )}
    </section>
  )
}
