// Calculate fare for the selected part of a train's full route.
export function getSegmentFare(train, fromCode, toCode, classType) {
  const stops = train && Array.isArray(train.stops) ? train.stops : []
  const classes = train && Array.isArray(train.classes) ? train.classes : []
  const fromStop = stops.find((stop) => stop.stationCode === fromCode)
  const toStop = stops.find((stop) => stop.stationCode === toCode)
  const selectedClass = classes.find((item) => item.type === classType)
  const firstStop = stops[0]
  const lastStop = stops[stops.length - 1]

  if (!fromStop || !toStop || !selectedClass || !firstStop || !lastStop) {
    return 0
  }
  const fullDistance = lastStop.distance - firstStop.distance
  if (fullDistance <= 0 || toStop.distance <= fromStop.distance) {
    return 0
  }
  return Math.round(selectedClass.fare * (toStop.distance - fromStop.distance) / fullDistance)
}

// Add the Tatkal surcharge to an already-calculated segment fare.
export function getQuotaFare(baseFare, quota) {
  if (quota === 'Tatkal') {
    return Math.round(baseFare * 1.3)
  }
  return baseFare
}
