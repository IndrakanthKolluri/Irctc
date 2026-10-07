// Count passengers who need an allocated seat.
export function getSeatPassengerCount(passengers) {
  let count = 0
  for (const passenger of passengers || []) {
    if (Number(passenger.age) >= 5) {
      count += 1
    }
  }
  return count
}

// Calculate the booking total, making children under five travel free.
export function getPassengerFareTotal(passengers, farePerPassenger) {
  let amount = 0
  for (const passenger of passengers || []) {
    if (Number(passenger.age) >= 5) {
      amount += farePerPassenger
    }
  }
  return amount
}

// Reject duplicate passengers in one reservation using normalized names.
export function hasDuplicatePassengers(passengers) {
  const names = new Set()
  for (const passenger of passengers || []) {
    const name = (passenger.name || '').trim().toLowerCase()
    if (names.has(name)) {
      return true
    }
    names.add(name)
  }
  return false
}
