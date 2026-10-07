import { getData, setData } from './db.js'
import { getFreeSeats, takeSeat } from '../utils/seatAllocator.js'

const classTypes = ['SL', '3A', '2A', '1A']

// Reject missing text fields before saving station or train records.
function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required.`)
  }
}

// Check a station's code is not already assigned to another station.
function checkStationCode(code, stations, currentId) {
  const duplicate = stations.find((station) => station.id !== currentId && station.code.toUpperCase() === code)
  if (duplicate) {
    throw new Error('A station with this code already exists.')
  }
}

// Validate ordered train stops against stations and increasing route distances.
function validateStops(stops, stations) {
  if (!Array.isArray(stops) || stops.length < 2) {
    throw new Error('A train route needs at least two stops.')
  }
  let previousDistance = -1
  for (const stop of stops) {
    const distance = Number(stop.distance)
    if (!stations.some((station) => station.code === stop.stationCode) || !/^\d{2}:\d{2}$/.test(stop.time || '')
      || !Number.isFinite(distance) || distance < 0 || distance <= previousDistance) {
      throw new Error('Choose valid stations, times, and increasing distances for every stop.')
    }
    previousDistance = distance
  }
}

// Validate class capacities and fares, retaining all supported class types.
function validateClasses(classes) {
  if (!Array.isArray(classes) || classes.length !== classTypes.length) {
    throw new Error('Configure SL, 3A, 2A, and 1A classes.')
  }
  for (const type of classTypes) {
    const item = classes.find((entry) => entry.type === type)
    if (!item || !Number.isInteger(Number(item.coaches)) || Number(item.coaches) < 0
      || !Number.isInteger(Number(item.seatsPerCoach)) || Number(item.seatsPerCoach) < 0
      || !Number.isFinite(Number(item.fare)) || Number(item.fare) < 0) {
      throw new Error(`Enter valid coaches, seats per coach, and fare for ${type}.`)
    }
  }
}

// Read the current stations and trains used by the admin screens.
export function getAdminData() {
  return { stations: getData('stations'), trains: getData('trains'), bookings: getData('bookings') }
}

// Find every train that serves the route; the result card shows date availability.
export function searchTrains(from, to) {
  const trains = getData('trains')
  const results = []
  for (const train of trains) {
    const stops = Array.isArray(train.stops) ? train.stops : []
    const fromIndex = stops.findIndex((stop) => stop.stationCode === from)
    const toIndex = stops.findIndex((stop) => stop.stationCode === to)
    if (fromIndex >= 0 && toIndex > fromIndex) {
      results.push(train)
    }
  }
  return results
}

// Validate station input and return the cleaned station data.
function prepareStation(details, stations, stationId) {
  details = details || {}
  const code = (details.code || '').trim().toUpperCase()
  const name = (details.name || '').trim()
  const city = (details.city || '').trim()
  requireText(code, 'Station code')
  requireText(name, 'Station name')
  requireText(city, 'City')
  if (!/^[A-Z0-9]{2,6}$/.test(code)) {
    throw new Error('Station codes must contain 2 to 6 letters or numbers.')
  }
  checkStationCode(code, stations, stationId)
  return { code, name, city }
}

// Update an existing station only when its code is not used by a train.
function updateStation(station, stationDetails) {
  if (station.code !== stationDetails.code && getData('trains').some((train) => (
    (train.stops || []).some((stop) => stop.stationCode === station.code)
  ))) {
    throw new Error('Remove this station from train routes before changing its code.')
  }
  Object.assign(station, stationDetails)
}

// Add or edit a station while preventing duplicate station codes.
export function saveStation(details, stationId = '') {
  const stations = getData('stations')
  const stationDetails = prepareStation(details, stations, stationId)
  if (stationId) {
    const station = stations.find((item) => item.id === stationId)
    if (!station) {
      throw new Error('Station could not be found.')
    }
    updateStation(station, stationDetails)
  } else {
    stations.push({ id: `station-${Date.now()}`, ...stationDetails })
  }
  setData('stations', stations)
}

// Remove a station only when no saved train route references it.
export function deleteStation(stationId) {
  const stations = getData('stations')
  const station = stations.find((item) => item.id === stationId)
  if (!station) {
    throw new Error('Station could not be found.')
  }
  if (getData('trains').some((train) => (train.stops || []).some((stop) => stop.stationCode === station.code))) {
    throw new Error('Remove this station from train routes before deleting it.')
  }
  setData('stations', stations.filter((item) => item.id !== stationId))
}

// Block a capacity reduction that would invalidate any date's confirmed seats.
function checkConfirmedCapacity(train, classes, bookings) {
  for (const nextClass of classes) {
    const oldClass = (train.classes || []).find((item) => item.type === nextClass.type)
    const nextCapacity = Number(nextClass.coaches) * Number(nextClass.seatsPerCoach)
    if (!oldClass || nextCapacity >= oldClass.coaches * oldClass.seatsPerCoach) {
      continue
    }
    const countsByDate = {}
    for (const booking of bookings) {
      if (!booking || booking.trainId !== train.id || booking.classType !== nextClass.type) {
        continue
      }
      countsByDate[booking.date] = (countsByDate[booking.date] || 0)
        + (booking.passengers || []).filter((passenger) => passenger.status === 'CNF' && passenger.seat).length
    }
    if (Object.values(countsByDate).some((count) => count > nextCapacity)) {
      throw new Error(`Cannot reduce ${nextClass.type} capacity below confirmed passengers for a travel date.`)
    }
  }
}

// Validate fields shared by a new train and an edited train.
function validateTrainDetails(details, trains, stations, trainId) {
  const number = (details.number || '').trim()
  const name = (details.name || '').trim()
  requireText(number, 'Train number')
  requireText(name, 'Train name')
  if (!/^\d{1,6}$/.test(number) || trains.some((train) => train.number === number && train.id !== trainId)) {
    throw new Error('Enter a unique train number containing up to 6 digits.')
  }
  if (!Array.isArray(details.runningDays) || details.runningDays.length === 0
    || details.runningDays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new Error('Select at least one valid running day.')
  }
  validateStops(details.stops, stations)
  validateClasses(details.classes)
}

// Convert form values into the flat train data shape used throughout the app.
function createTrainRecord(details, trainId) {
  return {
    id: trainId || `train-${Date.now()}`,
    number: details.number.trim(),
    name: details.name.trim(),
    runningDays: details.runningDays.slice().sort(),
    stops: details.stops.map((stop) => ({ stationCode: stop.stationCode, time: stop.time, distance: Number(stop.distance) })),
    classes: details.classes.map((item) => ({
      type: item.type,
      coaches: Number(item.coaches),
      seatsPerCoach: Number(item.seatsPerCoach),
      fare: Number(item.fare),
    })),
  }
}

// Validate and persist a train record with its ordered route and class capacity.
export function saveTrain(details, trainId = '') {
  details = details || {}
  const trains = getData('trains')
  const stations = getData('stations')
  const bookings = getData('bookings')
  validateTrainDetails(details, trains, stations, trainId)
  const train = trainId ? trains.find((item) => item.id === trainId) : null
  if (trainId && !train) {
    throw new Error('Train could not be found.')
  }
  if (train) {
    checkConfirmedCapacity(train, details.classes, bookings)
  }
  const nextTrain = createTrainRecord(details, trainId)
  if (train) {
    trains[trains.indexOf(train)] = nextTrain
  } else {
    trains.push(nextTrain)
  }
  setData('trains', trains)
}

// Promote as many waitlisted passengers as this class currently has free seats.
function promoteClassWaitlist(trainId, date, train, trainClass, bookings) {
  const freeSeats = getFreeSeats(train, trainClass.type, bookings, date)
  let waitlistNumber = 0
  let promoted = 0
  for (const booking of bookings) {
    if (!booking || booking.trainId !== trainId || booking.date !== date || booking.classType !== trainClass.type) {
      continue
    }
    for (const passenger of booking.passengers || []) {
      if (passenger.status !== 'WL') {
        continue
      }
      waitlistNumber += 1
      if (freeSeats.length > 0) {
        passenger.status = 'CNF'
        passenger.seat = takeSeat(freeSeats, passenger.berthPref)
        passenger.wlNumber = null
        promoted += 1
      } else {
        passenger.wlNumber = waitlistNumber
      }
    }
  }
  return promoted
}

// Refuse train deletion while any non-cancelled passengers are booked.
export function deleteTrain(trainId) {
  const trains = getData('trains')
  const train = trains.find((item) => item.id === trainId)
  if (!train) {
    throw new Error('Train could not be found.')
  }
  const hasActiveBookings = getData('bookings').some((booking) => booking && booking.trainId === trainId
    && (booking.passengers || []).some((passenger) => passenger.status !== 'CANCELLED'))
  if (hasActiveBookings) {
    throw new Error('This train has active bookings and cannot be deleted.')
  }
  setData('trains', trains.filter((item) => item.id !== trainId))
}

// Promote waiting passengers in saved booking order while seats are free.
export function settleWaitlist(trainId, date) {
  if (!trainId || !date) {
    throw new Error('Choose a train and travel date to settle the waitlist.')
  }
  const trains = getData('trains')
  const train = trains.find((item) => item.id === trainId)
  if (!train) {
    throw new Error('Train could not be found.')
  }
  const bookings = getData('bookings')
  let promoted = 0
  for (const trainClass of train.classes || []) {
    promoted += promoteClassWaitlist(trainId, date, train, trainClass, bookings)
  }

  if (promoted > 0) {
    for (const booking of bookings) {
      if (!booking || booking.trainId !== trainId || booking.date !== date) {
        continue
      }
      const activePassengers = (booking.passengers || [])
        .filter((passenger) => passenger.status !== 'CANCELLED')
      booking.status = activePassengers.length === 0
        ? 'CANCELLED'
        : activePassengers.some((passenger) => passenger.status === 'WL') ? 'WL' : 'CNF'
    }
    setData('bookings', bookings)
  }
  return promoted
}
