import Modal from './Modal.jsx'

// Let a passenger copy saved master-list entries into the current booking.
export default function PassengerMasterModal({ passengers, onSelect, onClose }) {
  return (
    <Modal title="Passenger Master List" onClose={onClose}>
      {passengers.length === 0 ? (
        <p className="text-sm text-slate-600">There are no saved passengers. Add them on your profile.</p>
      ) : (
        <div className="space-y-2">
          {passengers.map((passenger) => (
            <button
              key={passenger.id}
              type="button"
              onClick={() => onSelect(passenger)}
              className="block w-full rounded-md border p-3 text-left hover:bg-slate-50"
            >
              <strong>{passenger.name}</strong> · {passenger.age} · {passenger.gender}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
