// Create a unique ten-digit PNR by checking the current saved bookings.
export function generatePnr(bookings) {
  const existingPnrs = new Set((bookings || []).map((booking) => booking && booking.pnr))
  let pnr = String(Math.floor(1000000000 + Math.random() * 9000000000))
  while (existingPnrs.has(pnr)) {
    pnr = String(Math.floor(1000000000 + Math.random() * 9000000000))
  }
  return pnr
}

// Create a readable unique ID for a simulated payment transaction.
export function generateTransactionId() {
  const time = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TXN${time}${randomPart}`
}
