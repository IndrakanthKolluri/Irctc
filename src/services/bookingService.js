import { getData, setData } from './db.js'
import { getFreeSeats, takeSeat } from '../utils/seatAllocator.js'
import { generatePnr, generateTransactionId } from '../utils/pnr.js'
import { checkQuotaEligibility } from '../utils/quotaRules.js'
import { getSeatPassengerCount } from '../utils/bookingDraft.js'
import { getPassengerRefund, getHoursUntilDeparture } from '../utils/refund.js'

// Return the next waitlist number across every active booking for this pool.
function getNextWaitlistNumber(bookings, trainId, date, classType) {
  let count = 0
  for (const booking of bookings) {
    if (!booking || booking.trainId !== trainId || booking.date !== date || booking.classType !== classType) {
      continue
    }
    for (const passenger of booking.passengers || []) {
      if (passenger.status === 'WL') {
        count += 1
      }
    }
  }
  return count + 1
}

// Count all active waitlist places for a date and class.
function getWaitlistCount(bookings, trainId, date, classType) {
  return getNextWaitlistNumber(bookings, trainId, date, classType) - 1
}

// Validate booking fields that must still be true when payment completes.
function validateBookingDraft(draft, trains) {
  const train = (trains || []).find((item) => item && item.id === draft.trainId)
  if (!train) {
    throw new Error('The selected train no longer exists.')
  }
  const passengers = Array.isArray(draft.passengers) ? draft.passengers : []
  if (!passengers.length || passengers.length > 6) {
    throw new Error('A booking must have between 1 and 6 passengers.')
  }
  const quotaError = checkQuotaEligibility(draft.quota, passengers)
  if (quotaError) {
    throw new Error(quotaError)
  }
  return { train, passengers }
}

// Assign confirmed seats or waitlist positions to a booking's passengers.
function allocatePassengers(passengers, freeSeats, firstWaitlistNumber) {
  let waitlistNumber = firstWaitlistNumber
  const allocatedPassengers = []
  for (const passenger of passengers) {
    const passengerCopy = { ...passenger, seat: null, wlNumber: null }
    if (Number(passenger.age) < 5) {
      passengerCopy.status = 'CNF'
    } else if (freeSeats.length > 0) {
      passengerCopy.status = 'CNF'
      passengerCopy.seat = takeSeat(freeSeats, passenger.berthPref)
    } else {
      passengerCopy.status = 'WL'
      passengerCopy.wlNumber = waitlistNumber
      waitlistNumber += 1
    }
    allocatedPassengers.push(passengerCopy)
  }
  return allocatedPassengers
}

// Prepare the exact saved booking record and its generated identifiers.
function createBookingRecord(draft, passengers, bookings) {
  return {
    pnr: generatePnr(bookings),
    userId: draft.userId,
    trainId: draft.trainId,
    from: draft.from,
    to: draft.to,
    date: draft.date,
    classType: draft.classType,
    quota: draft.quota,
    transactionId: generateTransactionId(),
    status: passengers.every((passenger) => passenger.status === 'CNF') ? 'CNF' : 'WL',
    passengers,
    amount: draft.amount,
    refund: 0,
  }
}

// Create a booking after rechecking current seats synchronously before writing.
export function createBooking(details) {
  const draft = details || {}
  const bookings = getData('bookings')
  const trains = getData('trains')
  const { train, passengers } = validateBookingDraft(draft, trains)
  const freeSeats = getFreeSeats(train, draft.classType, bookings, draft.date)
  const seatPassengers = getSeatPassengerCount(passengers)
  if (draft.bookOnlyConfirmed && freeSeats.length < seatPassengers) {
    return { created: false, refunded: true, reason: 'Seats no longer available.' }
  }
  const waitlistPlaces = Math.max(10 - getWaitlistCount(bookings, train.id, draft.date, draft.classType), 0)
  if (!draft.bookOnlyConfirmed && seatPassengers > freeSeats.length + waitlistPlaces) {
    return { created: false, refunded: true, reason: 'The waitlist is full.' }
  }

  const nextWaitlistNumber = getNextWaitlistNumber(bookings, train.id, draft.date, draft.classType)
  const allocatedPassengers = allocatePassengers(passengers, freeSeats, nextWaitlistNumber)
  const booking = createBookingRecord(draft, allocatedPassengers, bookings)
  bookings.push(booking)
  setData('bookings', bookings)
  return { created: true, refunded: false, booking }
}

// Find the local departure timestamp from the booked source station's timetable.
function getDepartureTime(train, booking) {
  const fromStop = (train.stops || []).find((stop) => stop.stationCode === booking.from)
  if (!fromStop || !/^\d{2}:\d{2}$/.test(fromStop.time || '')) {
    throw new Error('The train departure time is unavailable.')
  }
  const departureTime = new Date(`${booking.date}T${fromStop.time}:00`)
  if (Number.isNaN(departureTime.getTime())) {
    throw new Error('The booking has an invalid travel date or departure time.')
  }
  return departureTime
}

// Count paid passengers so child passengers retain their zero fare on refunds.
function getPaidPassengerCount(passengers) {
  let count = 0
  for (const passenger of passengers || []) {
    if (Number(passenger.age) >= 5) {
      count += 1
    }
  }
  return count
}

// Calculate the refund preview for selected passengers without changing storage.
export function previewCancellation(pnr, passengerIndexes) {
  const booking = getData('bookings').find((item) => item && item.pnr === pnr)
  if (!booking) {
    throw new Error('No ticket was found for this PNR.')
  }
  const train = getData('trains').find((item) => item && item.id === booking.trainId)
  if (!train) {
    throw new Error('The train for this booking could not be found.')
  }
  const departureTime = getDepartureTime(train, booking)
  if (getHoursUntilDeparture(departureTime) <= 0) {
    throw new Error('This ticket cannot be cancelled after departure.')
  }
  const selectedIndexes = passengerIndexes || []
  const paidPassengerCount = getPaidPassengerCount(booking.passengers)
  const farePerPassenger = paidPassengerCount > 0 ? booking.amount / paidPassengerCount : 0
  let refund = 0
  for (const index of selectedIndexes) {
    const passenger = (booking.passengers || [])[index]
    if (!passenger || passenger.status === 'CANCELLED') {
      throw new Error('Choose passengers who have not already been cancelled.')
    }
    refund += getPassengerRefund(passenger, farePerPassenger, departureTime)
  }
  if (selectedIndexes.length === 0) {
    throw new Error('Select at least one passenger to cancel.')
  }
  return refund
}

// Cancel selected passengers and add their refunds without auto-promoting WL.
export function cancelPassengers(pnr, passengerIndexes) {
  const bookings = getData('bookings')
  const booking = bookings.find((item) => item && item.pnr === pnr)
  if (!booking) {
    throw new Error('No ticket was found for this PNR.')
  }
  const refund = previewCancellation(pnr, passengerIndexes)
  for (const index of passengerIndexes) {
    const passenger = booking.passengers[index]
    passenger.status = 'CANCELLED'
    passenger.wlNumber = null
  }
  booking.refund = Number(booking.refund || 0) + refund
  const activePassengers = booking.passengers.filter((passenger) => passenger.status !== 'CANCELLED')
  booking.status = activePassengers.length === 0
    ? 'CANCELLED'
    : activePassengers.some((passenger) => passenger.status === 'WL') ? 'WL' : 'CNF'
  setData('bookings', bookings)
  return { booking, refund }
}

// Find one ticket by PNR and return route and account display information.
export function getBookingByPnr(pnr) {
  const booking = getData('bookings').find((item) => item && item.pnr === (pnr || '').trim())
  if (!booking) {
    return null
  }
  const train = getData('trains').find((item) => item && item.id === booking.trainId) || null
  const stations = getData('stations')
  const fromStation = stations.find((station) => station.code === booking.from) || null
  const toStation = stations.find((station) => station.code === booking.to) || null
  return { booking, train, fromStation, toStation }
}

// Return this user's bookings in reverse creation order.
export function getUserBookings(userId) {
  const bookings = getData('bookings').filter((booking) => booking && booking.userId === userId)
  return bookings.reverse()
}
