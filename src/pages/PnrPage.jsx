import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../components/Button.jsx'

// Let anyone submit a PNR and look up the associated ticket.
export default function PnrPage() {
  const [pnr, setPnr] = useState('')
  const navigate = useNavigate()

  function submitPnr(event) {
    event.preventDefault()
    const cleanPnr = pnr.trim()
    if (!/^\d{10}$/.test(cleanPnr)) {
      toast.error('Enter a valid 10-digit PNR.')
      return
    }
    navigate(`/ticket/${cleanPnr}`)
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Check PNR</h1>
      <form onSubmit={submitPnr} className="rounded-lg border bg-white p-6">
        <label className="mb-4 block text-sm font-medium">10-digit PNR
          <input className="mt-1 block w-full rounded-md border p-2" inputMode="numeric" maxLength={10} value={pnr} onChange={(event) => setPnr(event.target.value)} required />
        </label>
        <Button type="submit">Find ticket</Button>
      </form>
    </main>
  )
}
