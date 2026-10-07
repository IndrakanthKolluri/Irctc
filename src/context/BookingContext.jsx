import { useEffect, useState } from 'react'
import { BookingContext } from './bookingContext.js'

const draftStorageKey = 'irctc-booking-draft'

// Read a saved in-progress booking so refreshes do not lose passenger details.
function readBookingDraft() {
  try {
    const savedDraft = sessionStorage.getItem(draftStorageKey)
    return savedDraft ? JSON.parse(savedDraft) : null
  } catch (error) {
    console.error('Could not restore the booking draft.', error)
    return null
  }
}

// Keep the active search and booking draft available across booking pages.
export function BookingProvider({ children }) {
  const [draft, setDraft] = useState(() => readBookingDraft())

  useEffect(() => {
    try {
      if (draft) {
        sessionStorage.setItem(draftStorageKey, JSON.stringify(draft))
      } else {
        sessionStorage.removeItem(draftStorageKey)
      }
    } catch (error) {
      console.error('Could not save the booking draft.', error)
    }
  }, [draft])

  function clearDraft() {
    setDraft(null)
  }

  return (
    <BookingContext.Provider value={{ draft, setDraft, clearDraft }}>
      {children}
    </BookingContext.Provider>
  )
}
