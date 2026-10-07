// Return a clear reason when passenger details do not meet quota eligibility.
export function checkQuotaEligibility(quota, passengers) {
  const passengerList = passengers || []
  if (quota === 'Ladies') {
    for (const passenger of passengerList) {
      if (passenger.gender === 'Female') {
        return ''
      }
    }
    return 'Ladies quota requires at least one female passenger.'
  }

  if (quota === 'Senior Citizen') {
    for (const passenger of passengerList) {
      const minimumAge = passenger.gender === 'Female' ? 58 : 60
      if (Number(passenger.age) >= minimumAge) {
        return ''
      }
    }
    return 'Senior Citizen quota requires an eligible passenger aged 60+, or a female passenger aged 58+.'
  }

  if (['General', 'Tatkal'].includes(quota)) {
    return ''
  }
  return 'Choose a valid quota.'
}
