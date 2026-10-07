import { useContext, useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import Modal from '../components/Modal.jsx'
import { AuthContext } from '../context/authContext.js'
import { updateUser } from '../services/authService.js'
import { validatePassenger } from '../utils/validators.js'

// Edit account details, passenger records, and masked payment references.
export default function ProfilePage() {
  const { user, refreshUser } = useContext(AuthContext)
  const [profile, setProfile] = useState({
    name: user.name,
    mobile: user.mobile,
    passengers: user.passengers || [],
    savedCards: user.savedCards || [],
    upiIds: user.upiIds || [],
  })
  const [showPassengerForm, setShowPassengerForm] = useState(false)
  const [passengerDraft, setPassengerDraft] = useState({ name: '', age: '', gender: 'Female' })
  const [editingPassengerId, setEditingPassengerId] = useState('')
  const [cardDraft, setCardDraft] = useState({ holder: '', number: '' })
  const [upiDraft, setUpiDraft] = useState('')

  function saveProfile(nextProfile = profile) {
    try {
      updateUser(user.id, nextProfile)
      refreshUser()
      toast.success('Profile saved.')
    } catch (error) {
      toast.error(error.message)
    }
  }

  function savePassenger(event) {
    event.preventDefault()
    const validationError = validatePassenger({ ...passengerDraft, age: Number(passengerDraft.age) })
    if (validationError) {
      toast.error(validationError)
      return
    }
    const passenger = {
      ...passengerDraft,
      age: Number(passengerDraft.age),
      id: editingPassengerId || `passenger-${Date.now()}`,
    }
    const passengers = profile.passengers.slice()
    const existingIndex = passengers.findIndex((item) => item.id === editingPassengerId)
    if (existingIndex >= 0) {
      passengers[existingIndex] = passenger
    } else {
      passengers.push(passenger)
    }
    const nextProfile = { ...profile, passengers }
    setProfile(nextProfile)
    setShowPassengerForm(false)
    setEditingPassengerId('')
    setPassengerDraft({ name: '', age: '', gender: 'Female' })
    saveProfile(nextProfile)
  }

  function editPassenger(passenger) {
    setPassengerDraft({ name: passenger.name, age: String(passenger.age), gender: passenger.gender })
    setEditingPassengerId(passenger.id)
    setShowPassengerForm(true)
  }

  function deletePassenger(id) {
    const nextProfile = { ...profile, passengers: profile.passengers.filter((item) => item.id !== id) }
    setProfile(nextProfile)
    saveProfile(nextProfile)
  }

  function addSavedCard(event) {
    event.preventDefault()
    const digits = cardDraft.number.replace(/\D/g, '')
    if (!cardDraft.holder.trim() || digits.length < 12 || digits.length > 19) {
      toast.error('Enter a cardholder name and a valid card number.')
      return
    }
    const savedCards = [...profile.savedCards, { id: `card-${Date.now()}`, holder: cardDraft.holder.trim(), last4: digits.slice(-4) }]
    const nextProfile = { ...profile, savedCards }
    setProfile(nextProfile)
    setCardDraft({ holder: '', number: '' })
    saveProfile(nextProfile)
  }

  function addUpiId(event) {
    event.preventDefault()
    const value = upiDraft.trim()
    if (!/^[A-Za-z0-9._-]+@[A-Za-z][A-Za-z0-9]{1,19}$/.test(value)) {
      toast.error('Enter a valid UPI ID, such as name@bank.')
      return
    }
    const nextProfile = { ...profile, upiIds: [...profile.upiIds, value] }
    setProfile(nextProfile)
    setUpiDraft('')
    saveProfile(nextProfile)
  }

  function removeSavedItem(field, idOrValue) {
    const nextProfile = {
      ...profile,
      [field]: profile[field].filter((item) => typeof item === 'string' ? item !== idOrValue : item.id !== idOrValue),
    }
    setProfile(nextProfile)
    saveProfile(nextProfile)
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">My Profile</h1>
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Account details</h2>
        <Input id="profile-name" label="Name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
        <Input id="profile-email" label="Email (read only)" type="email" value={user.email} readOnly />
        <Input id="profile-mobile" label="Mobile" type="tel" value={profile.mobile} onChange={(event) => setProfile({ ...profile, mobile: event.target.value })} required />
        <Button onClick={() => saveProfile()}>Save profile</Button>
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Passenger Master List</h2>
          <Button onClick={() => { setEditingPassengerId(''); setPassengerDraft({ name: '', age: '', gender: 'Female' }); setShowPassengerForm(true) }}>Add passenger</Button>
        </div>
        {profile.passengers.length === 0 && <p className="text-sm text-slate-600">No saved passengers yet.</p>}
        {profile.passengers.map((passenger) => (
          <div key={passenger.id} className="flex items-center justify-between border-t py-3">
            <span>{passenger.name} · {passenger.age} · {passenger.gender}</span>
            <span className="flex gap-3">
              <button className="text-blue-800 underline" onClick={() => editPassenger(passenger)}>Edit</button>
              <button className="text-red-700 underline" onClick={() => deletePassenger(passenger.id)}>Delete</button>
            </span>
          </div>
        ))}
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Saved cards</h2>
        {profile.savedCards.map((card) => (
          <div key={card.id} className="flex justify-between border-t py-3">
            <span>{card.holder} · ending {card.last4}</span>
            <button className="text-red-700 underline" onClick={() => removeSavedItem('savedCards', card.id)}>Remove</button>
          </div>
        ))}
        <form onSubmit={addSavedCard} className="mt-4">
          <Input id="card-holder" label="Cardholder name" value={cardDraft.holder} onChange={(event) => setCardDraft({ ...cardDraft, holder: event.target.value })} required />
          <Input id="card-number" label="Card number (not stored)" inputMode="numeric" autoComplete="cc-number" value={cardDraft.number} onChange={(event) => setCardDraft({ ...cardDraft, number: event.target.value })} required />
          <Button type="submit">Save masked card</Button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Saved UPI IDs</h2>
        {profile.upiIds.map((upi) => (
          <div key={upi} className="flex justify-between border-t py-3">
            <span>{upi}</span>
            <button className="text-red-700 underline" onClick={() => removeSavedItem('upiIds', upi)}>Remove</button>
          </div>
        ))}
        <form onSubmit={addUpiId} className="mt-4">
          <Input id="upi-id" label="UPI ID" value={upiDraft} onChange={(event) => setUpiDraft(event.target.value)} placeholder="name@bank" required />
          <Button type="submit">Add UPI ID</Button>
        </form>
      </section>

      {showPassengerForm && (
        <Modal title={editingPassengerId ? 'Edit passenger' : 'Add passenger'} onClose={() => setShowPassengerForm(false)}>
          <form onSubmit={savePassenger}>
            <Input id="passenger-name" label="Name" value={passengerDraft.name} onChange={(event) => setPassengerDraft({ ...passengerDraft, name: event.target.value })} required />
            <Input id="passenger-age" label="Age" type="number" min="1" max="120" value={passengerDraft.age} onChange={(event) => setPassengerDraft({ ...passengerDraft, age: event.target.value })} required />
            <label className="mb-4 block text-sm font-medium">Gender
              <select className="mt-1 block w-full rounded-md border border-slate-300 p-2" value={passengerDraft.gender} onChange={(event) => setPassengerDraft({ ...passengerDraft, gender: event.target.value })}>
                <option>Female</option><option>Male</option><option>Other</option>
              </select>
            </label>
            <Button type="submit">Save passenger</Button>
          </form>
        </Modal>
      )}
    </main>
  )
}
