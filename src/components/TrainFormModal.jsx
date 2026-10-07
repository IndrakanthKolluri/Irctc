import { useState } from 'react'
import { toast } from 'react-toastify'
import Button from './Button.jsx'
import Input from './Input.jsx'
import Modal from './Modal.jsx'
import { saveTrain } from '../services/trainService.js'

const classTypes = ['SL', '3A', '2A', '1A']
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Start a new form with editable stops and capacities for every class.
function createEmptyTrain(stations) {
  const first = stations[0] || { code: '' }
  const second = stations[1] || first
  return {
    number: '',
    name: '',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    stops: [
      { stationCode: first.code, time: '08:00', distance: 0 },
      { stationCode: second.code, time: '12:00', distance: 100 },
    ],
    classes: classTypes.map((type) => ({ type, coaches: 1, seatsPerCoach: 1, fare: 100 })),
  }
}

// Render the train route editor and persist its validated values.
export default function TrainFormModal({ train, stations, onClose, onSaved }) {
  const [draft, setDraft] = useState(() => train
    ? {
      number: train.number,
      name: train.name,
      runningDays: train.runningDays.slice(),
      stops: train.stops.map((stop) => ({ ...stop })),
      classes: classTypes.map((type) => {
        const trainClass = train.classes.find((item) => item.type === type)
        return trainClass ? { ...trainClass } : { type, coaches: 0, seatsPerCoach: 0, fare: 0 }
      }),
    }
    : createEmptyTrain(stations))

  function updateStop(index, field, value) {
    const stops = draft.stops.map((stop, stopIndex) => (
      stopIndex === index ? { ...stop, [field]: value } : stop
    ))
    setDraft({ ...draft, stops })
  }

  function updateClass(index, field, value) {
    const classes = draft.classes.map((item, classIndex) => (
      classIndex === index ? { ...item, [field]: value } : item
    ))
    setDraft({ ...draft, classes })
  }

  function toggleDay(day) {
    let runningDays = draft.runningDays.slice()
    if (runningDays.includes(day)) {
      runningDays = runningDays.filter((value) => value !== day)
    } else {
      runningDays.push(day)
    }
    setDraft({ ...draft, runningDays })
  }

  function submitTrain(event) {
    event.preventDefault()
    try {
      saveTrain(draft, train ? train.id : '')
      onSaved()
      toast.success(train ? 'Train updated.' : 'Train added.')
    } catch (error) {
      toast.error(error.message)
    }
  }

  function addStop() {
    const finalStop = draft.stops[draft.stops.length - 1]
    setDraft({
      ...draft,
      stops: [...draft.stops, { stationCode: stations[0].code, time: '16:00', distance: Number(finalStop.distance) + 100 }],
    })
  }

  function removeStop(index) {
    if (draft.stops.length <= 2) {
      toast.error('A train route must have at least two stops.')
      return
    }
    setDraft({ ...draft, stops: draft.stops.filter((stop, stopIndex) => stopIndex !== index) })
  }

  return (
    <Modal title={train ? 'Edit train' : 'Add train'} onClose={onClose}>
      <form onSubmit={submitTrain} className="space-y-2">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input id="train-number" label="Train number" value={draft.number} onChange={(event) => setDraft({ ...draft, number: event.target.value })} required />
          <Input id="train-name" label="Train name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
        </div>
        <fieldset className="mb-4">
          <legend className="mb-1 text-sm font-semibold text-slate-800">Operating days</legend>
          <p className="mb-3 text-xs text-slate-500">Select every weekday this train operates.</p>
          <div className="flex flex-wrap gap-3">
            {dayNames.map((day, index) => (
              <label key={day} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={draft.runningDays.includes(index)} onChange={() => toggleDay(index)} />
                {day}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Route stops in travel order</h3>
            <Button onClick={addStop} disabled={stations.length === 0}>Add stop</Button>
          </div>
          {draft.stops.map((stop, index) => (
            <div key={`stop-${index}`} className="mb-3 rounded-md border p-3">
              <p className="mb-2 text-sm font-medium">Stop {index + 1}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <label className="text-sm">Station
                  <select className="mt-1 block w-full rounded border p-2" value={stop.stationCode} onChange={(event) => updateStop(index, 'stationCode', event.target.value)} required>
                    {stations.map((station) => <option key={station.id} value={station.code}>{station.code} · {station.name}</option>)}
                  </select>
                </label>
                <Input id={`stop-time-${index}`} label="Time" type="time" value={stop.time} onChange={(event) => updateStop(index, 'time', event.target.value)} required />
                <Input id={`stop-distance-${index}`} label="Distance (km)" type="number" min="0" value={stop.distance} onChange={(event) => updateStop(index, 'distance', event.target.value)} required />
              </div>
              {index > 0 && <button type="button" className="text-sm text-red-700 underline" onClick={() => removeStop(index)}>Remove stop</button>}
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h3 className="mb-2 font-semibold">Class capacities and full-route fares</h3>
          <div className="space-y-3">
            {draft.classes.map((item, index) => (
              <div key={item.type} className="grid grid-cols-4 items-end gap-2 rounded-md border p-3">
                <strong>{item.type}</strong>
                <Input id={`coaches-${item.type}`} label="Coaches" type="number" min="0" value={item.coaches} onChange={(event) => updateClass(index, 'coaches', event.target.value)} required />
                <Input id={`seats-${item.type}`} label="Seats/coach" type="number" min="0" value={item.seatsPerCoach} onChange={(event) => updateClass(index, 'seatsPerCoach', event.target.value)} required />
                <Input id={`fare-${item.type}`} label="Fare (Rs)" type="number" min="0" value={item.fare} onChange={(event) => updateClass(index, 'fare', event.target.value)} required />
              </div>
            ))}
          </div>
        </div>
        <Button type="submit">Save train</Button>
      </form>
    </Modal>
  )
}
