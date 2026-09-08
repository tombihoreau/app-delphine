export const volumeUnitOptions = [
  { value: 'minutes', label: 'Min' },
  { value: 'kilometers', label: 'Km' },
  { value: 'repetitions', label: 'Reps' }
]

export const formatVolume = (value, unit = 'minutes') => {
  const numericValue = Number(value || 0)
  if (!numericValue) return ''

  const formattedValue = numericValue.toLocaleString('fr-FR', {
    maximumFractionDigits: 1
  })

  if (unit === 'kilometers') return `${formattedValue} Km`
  if (unit === 'repetitions') return `${formattedValue} Reps`
  return `${formattedValue} Min`
}

export const formatStepVolume = (step = {}) => (
  formatVolume(step.volume_value ?? step.duration_minutes ?? step.duration, step.volume_unit)
)

export const formatSessionVolume = (session = {}) => (
  formatVolume(
    session.session_volume_value ?? session.session_minutes,
    session.session_volume_unit || 'minutes'
  )
)
