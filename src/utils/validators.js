// Check required text without accepting whitespace-only input.
export function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

// Validate a simple email shape for this frontend-only simulation.
export function isValidEmail(value) {
  if (!hasText(value)) {
    return false
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Accept an Indian mobile number with or without the +91 prefix.
export function isValidMobile(value) {
  if (!hasText(value)) {
    return false
  }
  const digits = value.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'))
}

// Validate passenger names, ages, and gender before saving them.
export function validatePassenger(passenger) {
  if (!passenger || !/^[A-Za-z ]+$/.test((passenger.name || '').trim())) {
    return 'Enter a passenger name using letters and spaces only.'
  }
  if (!Number.isInteger(Number(passenger.age)) || passenger.age < 1 || passenger.age > 120) {
    return 'Passenger age must be between 1 and 120.'
  }
  if (!['Male', 'Female', 'Other'].includes(passenger.gender)) {
    return 'Choose a valid passenger gender.'
  }
  return ''
}

// Check a date-only input using local calendar dates, not UTC conversion.
export function isValidFutureDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    return false
  }
  const selectedDate = new Date(`${value}T00:00:00`)
  const [year, month, day] = value.split('-').map(Number)
  if (selectedDate.getFullYear() !== year || selectedDate.getMonth() + 1 !== month || selectedDate.getDate() !== day) {
    return false
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return !Number.isNaN(selectedDate.getTime()) && selectedDate >= today
}
