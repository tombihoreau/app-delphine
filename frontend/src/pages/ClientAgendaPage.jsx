import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import SunIcon from '../components/SunIcon'
import { formatSessionVolume } from '../utils/volume'

const weekLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sa', 'Di']

const Chevron = ({ direction = 'left' }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </svg>
)

const getMonthLabel = (date) =>
  date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildCalendarDays = (currentMonth, assignmentsByDate) => {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const startDate = new Date(year, month, 1 - startOffset)

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)
    const key = formatDateKey(date)

    return {
      key,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      hasAssignments: Boolean(assignmentsByDate[key]?.length)
    }
  })
}

const ClientAgendaPage = () => {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()))
  const [error, setError] = useState('')

  useEffect(() => {
    loadAssignments()
  }, [])

  const assignmentsByDate = useMemo(() => (
    assignments.reduce((acc, assignment) => {
      if (!acc[assignment.scheduled_date]) acc[assignment.scheduled_date] = []
      acc[assignment.scheduled_date].push(assignment)
      return acc
    }, {})
  ), [assignments])

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth, assignmentsByDate),
    [currentMonth, assignmentsByDate]
  )

  const selectedAssignments = assignmentsByDate[selectedDate] || []

  const loadAssignments = async () => {
    try {
      const response = await api.get('/api/client/calendar')
      setAssignments(response.data)
    } catch (err) {
      setError("Erreur lors du chargement de l'agenda")
    }
  }

  return (
    <div className="client-screen">
      <div className="client-frame">
        {error && <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">{error}</p>}

        <h1 className="mb-8 flex items-center gap-2 font-display text-3xl font-normal text-brand-tamarillo">
          <SunIcon className="h-8 w-8" />
          Mon agenda
        </h1>

        <div className="mb-5 flex items-center justify-between text-brand-tamarillo">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            aria-label="Mois précédent"
          >
            <Chevron direction="left" />
          </button>
          <h2 className="text-xl font-light capitalize text-brand-brown">{getMonthLabel(currentMonth)}</h2>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            aria-label="Mois suivant"
          >
            <Chevron direction="right" />
          </button>
        </div>

        <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs text-brand-brown">
          {weekLabels.map((label) => <div key={label}>{label}</div>)}
        </div>

        <div className="mb-7 grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const isSelected = day.key === selectedDate
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDate(day.key)}
                className={`relative flex aspect-square items-center justify-center rounded-md font-display text-xl font-normal ${
                  isSelected
                    ? 'bg-brand-tamarillo text-brand-beige'
                    : day.isCurrentMonth
                      ? 'bg-brand-peach/35 text-brand-brown'
                      : 'bg-transparent text-brand-brown/35'
                }`}
              >
                {day.day}
                {day.hasAssignments ? (
                  <span className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-brand-beige' : 'bg-brand-tamarillo'}`} />
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          {selectedAssignments.length === 0 ? (
            <div className="rounded-md border border-brand-tamarillo/30 p-4 text-sm text-brand-tamarillo">
              Aucune séance prévue pour cette date.
            </div>
          ) : (
            selectedAssignments.map((assignment) => (
              <article key={assignment.id} className="rounded-md border border-brand-tamarillo p-3">
                <button
                  type="button"
                  onClick={() => navigate(`/sessions/${assignment.id}`)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div>
                    <h3 className="text-lg font-light text-brand-tamarillo">{assignment.program_name}</h3>
	                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-brand-brown">
	                      <span className="inline-flex items-center gap-1"><ClockIcon />{formatSessionVolume(assignment) || '35 Min'}</span>
	                    </div>
	                    <span className="mt-2 inline-flex rounded-full border border-brand-tamarillo px-3 py-1 text-xs text-brand-tamarillo">
	                      {assignment.program_category}
	                    </span>
                  </div>
                  <span className="mt-2 shrink-0 text-brand-tamarillo"><Chevron direction="right" /></span>
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientAgendaPage
