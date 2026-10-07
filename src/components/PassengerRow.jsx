const berthOptions = ['No Preference', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper']

// Edit one passenger's name, age, gender, and requested berth.
export default function PassengerRow({ passenger, index, onChange, onRemove }) {
  function update(field, value) {
    onChange(index, { ...passenger, [field]: value })
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Passenger {index + 1}</h3>
        {index > 0 && <button type="button" className="text-sm text-red-700 underline" onClick={() => onRemove(index)}>Remove</button>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Name
          <input className="mt-1 block w-full rounded-md border p-2" value={passenger.name} onChange={(event) => update('name', event.target.value)} required />
        </label>
        <label className="text-sm font-medium">Age
          <input className="mt-1 block w-full rounded-md border p-2" type="number" min="1" max="120" value={passenger.age} onChange={(event) => update('age', event.target.value)} required />
        </label>
        <label className="text-sm font-medium">Gender
          <select className="mt-1 block w-full rounded-md border p-2" value={passenger.gender} onChange={(event) => update('gender', event.target.value)}>
            <option>Female</option><option>Male</option><option>Other</option>
          </select>
        </label>
        <label className="text-sm font-medium">Berth preference
          <select className="mt-1 block w-full rounded-md border p-2" value={passenger.berthPref} onChange={(event) => update('berthPref', event.target.value)}>
            {berthOptions.map((berth) => <option key={berth}>{berth}</option>)}
          </select>
        </label>
      </div>
      {Number(passenger.age) > 0 && Number(passenger.age) < 5 && <p className="mt-2 text-sm text-amber-800">Under 5: fare-free and no seat will be allocated.</p>}
    </section>
  )
}
