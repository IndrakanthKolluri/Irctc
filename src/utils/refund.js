// Calculate one passenger's refund from departure time and booking status.
export function getPassengerRefund(passenger, passengerFare, departureTime, now = new Date()) {
  if (!passenger || passenger.status === 'CANCELLED') {
    return 0
  }

  let refundRate = 1
  if (passenger.status !== 'WL') {
    const hoursBeforeDeparture = (new Date(departureTime) - now) / (1000 * 60 * 60)
    if (hoursBeforeDeparture > 48) {
      refundRate = 0.9
    } else if (hoursBeforeDeparture >= 12) {
      refundRate = 0.5
    } else {
      refundRate = 0.25
    }
  }

  return Math.max(0, Math.round(passengerFare * refundRate) - 20)
}

// Sum per-passenger refunds without counting passengers already cancelled.
export function getBookingRefund(passengers, passengerFare, departureTime, now = new Date()) {
  let refund = 0
  for (const passenger of passengers || []) {
    refund += getPassengerRefund(passenger, passengerFare, departureTime, now)
  }
  return refund
}

// Count elapsed hours until the train leaves its booked source station.
export function getHoursUntilDeparture(departureTime, now = new Date()) {
  return (new Date(departureTime).getTime() - now.getTime()) / (1000 * 60 * 60)
}
