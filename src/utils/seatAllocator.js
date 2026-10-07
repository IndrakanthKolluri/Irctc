const berthNames = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'Lower']
const coachPrefixes = { SL: 'S', '3A': 'B', '2A': 'A', '1A': 'H' }

// Collect occupied labels so existing confirmed seats cannot be reused.
function getOccupiedSeats(train, bookings, date, classType) {
  const occupiedSeats = new Set()
  for (const booking of bookings || []) {
    if (!booking || booking.trainId !== train.id || booking.date !== date || booking.classType !== classType) {
      continue
    }
    for (const passenger of booking.passengers || []) {
      if (passenger.status === 'CNF' && passenger.seat) {
        occupiedSeats.add(passenger.seat)
      }
    }
  }
  return occupiedSeats
}

// Build seat labels and remove seats already assigned to confirmed passengers.
export function getFreeSeats(train, classType, bookings, date) {
  const classes = train && Array.isArray(train.classes) ? train.classes : []
  const selectedClass = classes.find((item) => item.type === classType)
  if (!selectedClass) {
    return []
  }

  const occupiedSeats = getOccupiedSeats(train, bookings, date, classType)
  const freeSeats = []
  const coachPrefix = coachPrefixes[classType] || classType
  for (let coach = 1; coach <= selectedClass.coaches; coach += 1) {
    for (let number = 1; number <= selectedClass.seatsPerCoach; number += 1) {
      const berth = berthNames[(number - 1) % berthNames.length]
      const label = `${coachPrefix}${coach}-${number}-${berth}`
      if (!occupiedSeats.has(label)) {
        freeSeats.push({ label, berth })
      }
    }
  }
  return freeSeats
}

// Choose a preferred free berth when possible, otherwise use the first free seat.
export function takeSeat(freeSeats, berthPref) {
  if (!Array.isArray(freeSeats) || freeSeats.length === 0) {
    return null
  }

  let seatIndex = 0
  if (berthPref && berthPref !== 'No Preference') {
    for (let index = 0; index < freeSeats.length; index += 1) {
      if (freeSeats[index].berth === berthPref) {
        seatIndex = index
        break
      }
    }
  }
  return freeSeats.splice(seatIndex, 1)[0].label
}
