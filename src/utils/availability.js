// Count confirmed passengers against the selected date's shared seat pool.
export function getAvailability(train, bookings, date, classType) {
  const classes = train && Array.isArray(train.classes) ? train.classes : []
  const selectedClass = classes.find((item) => item.type === classType)
  const totalSeats = selectedClass ? selectedClass.coaches * selectedClass.seatsPerCoach : 0
  let confirmedSeats = 0
  let waitlistCount = 0

  for (const booking of bookings || []) {
    if (!train || !booking || booking.trainId !== train.id || booking.date !== date || booking.classType !== classType) {
      continue
    }
    for (const passenger of booking.passengers || []) {
      if (passenger.status === 'CNF' && passenger.seat) {
        confirmedSeats += 1
      } else if (passenger.status === 'WL') {
        waitlistCount += 1
      }
    }
  }

  const freeSeats = Math.max(totalSeats - confirmedSeats, 0)
  let status = `AVAILABLE ${freeSeats}`
  if (freeSeats === 0 && waitlistCount < 10) {
    status = `WL ${waitlistCount + 1}`
  } else if (freeSeats === 0) {
    status = 'REGRET'
  }

  return { totalSeats, confirmedSeats, freeSeats, waitlistCount, status }
}
