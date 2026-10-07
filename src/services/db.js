import { seedBookings, seedStations, seedTrains, seedUsers } from '../data/seed.js'

const validKeys = ['users', 'stations', 'trains', 'bookings', 'session']
const arrayKeys = ['users', 'stations', 'trains', 'bookings']

// Return an empty list or null if storage is missing, malformed, or unavailable.
function getDefaultValue(key) {
  if (arrayKeys.includes(key)) {
    return []
  }
  return null
}

// Read one known storage key and reject corrupted values of the wrong shape.
export function getData(key) {
  if (!validKeys.includes(key)) {
    return getDefaultValue(key)
  }

  try {
    const storedValue = localStorage.getItem(key)
    if (!storedValue) {
      return getDefaultValue(key)
    }

    const value = JSON.parse(storedValue)
    if (arrayKeys.includes(key) && Array.isArray(value)) {
      return value
    }
    if (key === 'session' && value && typeof value === 'object' && !Array.isArray(value)) {
      return value
    }
  } catch (error) {
    console.error(`Could not read "${key}" from localStorage.`, error)
  }

  return getDefaultValue(key)
}

// Save JSON data, throwing a visible error when the browser cannot persist it.
export function setData(key, value) {
  if (!validKeys.includes(key)) {
    throw new Error(`Unknown storage key: ${key}`)
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Could not save "${key}" to localStorage.`, error)
    throw new Error('Your browser could not save this data. Check storage settings.', { cause: error })
  }
}

// Seed only the core lists that are missing or currently empty.
export function seedEmptyStorage() {
  const seedLists = {
    users: seedUsers,
    stations: seedStations,
    trains: seedTrains,
    bookings: seedBookings,
  }

  for (const key of Object.keys(seedLists)) {
    const currentData = getData(key)
    if (currentData.length === 0 && seedLists[key].length > 0) {
      setData(key, seedLists[key])
    }
  }
}
