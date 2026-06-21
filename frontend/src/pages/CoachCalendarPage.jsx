import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import api from '../services/api'
import MoodSmiley from '../components/MoodSmiley'

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

const moodLabel = (value) => ({
  5: 'Très bien',
  4: 'Bien',
  3: 'Neutre',
  2: 'Fatigué',
  1: 'En colère'
}[Number(value)] || 'Non renseigné')

const fatigueLabel = (value) => ({
  5: 'Énergique',
  4: 'En forme',
  3: 'Moyen',
  2: 'Fatigué',
  1: 'Très fatigué'
}[Number(value)] || 'Non renseigné')

const stressLabel = (value) => ({
  1: 'Calme',
  2: 'Un peu',
  3: 'Moyen',
  4: 'Stressé',
  5: 'Très stressé'
}[Number(value)] || 'Non renseigné')

const sleepLabel = (value) => ({
  5: 'Excellent',
  4: 'Bon',
  3: 'Correct',
  2: 'Mauvais',
  1: 'Très mauvais'
}[Number(value)] || 'Non renseigné')

const difficultyLabel = (value) => ({
  1: 'Très facile',
  2: 'Facile',
  3: 'Modéré',
  4: 'Difficile',
  5: 'Effort maximal'
}[Number(value)] || 'Non renseigné')

const chipTone = (value, inverse = false) => {
  const score = Number(value)
  if (!score) return 'border-brand-brown/25 bg-brand-beige text-brand-brown/60'

  if (inverse) {
    if (score <= 2) return 'border-[#58a56d] bg-[#e8f7ea] text-[#34824a]'
    if (score === 3) return 'border-[#b6aeb9] bg-[#eee8ef] text-[#6f6470]'
    return 'border-[#e58f77] bg-[#f8d8cc] text-[#9b3b28]'
  }

  if (score >= 4) return 'border-[#58a56d] bg-[#e8f7ea] text-[#34824a]'
  if (score === 3) return 'border-[#b6aeb9] bg-[#eee8ef] text-[#6f6470]'
  return 'border-[#e58f77] bg-[#f8d8cc] text-[#9b3b28]'
}

const StatRow = ({ label, value, tone }) => (
  <div className="flex items-center justify-between gap-3 border-b border-brand-brown/10 py-2 text-sm">
    <span className="text-[#b33727]">{label}</span>
    <span className={`shrink-0 rounded-full border px-3 py-1 ${tone}`}>
      {value}
    </span>
  </div>
)

const ClientAgendaBlock = ({ clientGroup, expanded, onToggle, onViewProgram }) => {
  const firstAssignment = clientGroup.assignments[0]
  const hasCheckin = firstAssignment.checkin_mood || firstAssignment.checkin_energy || firstAssignment.checkin_sleep_quality || firstAssignment.checkin_stress

  return (
    <article className="border-t border-[#d98978] py-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left text-brand-tamarillo"
      >
        <span className="flex min-w-0 items-center gap-3">
          {firstAssignment.checkin_mood ? (
            <MoodSmiley value={firstAssignment.checkin_mood} className="h-10 w-10 shrink-0" />
          ) : null}
          <span className="truncate text-xl font-normal text-brand-brown">
            {clientGroup.userName}
          </span>
        </span>
        <span className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          <Chevron direction="left" />
        </span>
      </button>

      {expanded ? (
        <div className="pt-5">
          {hasCheckin ? (
            <div className="mb-5">
              {firstAssignment.checkin_mood ? (
                <div className="mb-4 flex flex-col items-center">
                  <MoodSmiley value={firstAssignment.checkin_mood} className="h-24 w-24" />
                  <p className="mt-1 text-sm text-brand-tamarillo">{moodLabel(firstAssignment.checkin_mood)}</p>
                </div>
              ) : null}

              <StatRow
                label="Niveau de fatigue"
                value={fatigueLabel(firstAssignment.checkin_energy)}
                tone={chipTone(firstAssignment.checkin_energy)}
              />
              <StatRow
                label="Niveau de stress"
                value={stressLabel(firstAssignment.checkin_stress)}
                tone={chipTone(firstAssignment.checkin_stress, true)}
              />
              <StatRow
                label="Sommeil"
                value={sleepLabel(firstAssignment.checkin_sleep_quality)}
                tone={chipTone(firstAssignment.checkin_sleep_quality)}
              />
            </div>
          ) : (
            <p className="mb-5 text-sm text-brand-brown/60">Humeur non renseignée pour ce jour.</p>
          )}

          <div className="space-y-4">
            {clientGroup.assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-md bg-brand-peach/55 p-4 text-brand-tamarillo">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-normal">{assignment.program_name}</h3>
	                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-brand-brown">
	                      <span className="inline-flex items-center gap-1"><ClockIcon />{assignment.session_minutes || 35} min</span>
	                    </div>
	                    <span className="mt-2 inline-flex rounded-full border border-brand-tamarillo px-3 py-1 text-xs text-brand-tamarillo">
	                      {assignment.program_category}
	                    </span>
                  </div>
                  {assignment.feedback_id ? (
                    <span className="shrink-0 rounded-full border border-[#58a56d] bg-[#e8f7ea] px-3 py-1 text-sm text-[#34824a]">
                      ✓ Réalisé
                    </span>
                  ) : null}
                </div>

                <StatRow
                  label="Effort ressenti"
                  value={difficultyLabel(assignment.feedback_difficulty)}
                  tone={chipTone(assignment.feedback_difficulty, true)}
                />
                <div className="border-b border-brand-brown/10 py-2 text-sm">
                  <p className="text-[#b33727]">Douleurs</p>
                  <p className="mt-1 text-brand-brown/70">
                    {assignment.feedback_pain_notes || 'Aucune douleur ajoutée'}
                  </p>
                </div>

                <div className="border-b border-brand-brown/10 py-2 text-sm">
                  <p className="text-[#b33727]">Commentaires</p>
                  <p className="mt-1 text-brand-brown/70">
                    {assignment.feedback_comments || 'Aucun commentaire ajouté'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onViewProgram(assignment)}
                  className="mt-3 w-full rounded-md bg-brand-tamarillo px-5 py-3 text-lg font-normal text-brand-beige"
                >
                  Voir le programme
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}

const CoachCalendarPage = () => {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()))
  const [expandedClientId, setExpandedClientId] = useState(null)
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

  const selectedClientGroups = useMemo(() => {
    const groups = selectedAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.user_id]) {
        acc[assignment.user_id] = {
          userId: assignment.user_id,
          userName: assignment.user_name,
          assignments: []
        }
      }

      acc[assignment.user_id].assignments.push(assignment)
      return acc
    }, {})

    return Object.values(groups)
  }, [selectedAssignments])

  useEffect(() => {
    setExpandedClientId((current) => {
      if (current && selectedClientGroups.some((group) => group.userId === current)) {
        return current
      }

      return null
    })
  }, [selectedClientGroups])

  const loadAssignments = async () => {
    try {
      const response = await api.get('/api/admin/assignments')
      setAssignments(response.data || [])
    } catch (err) {
      setError("Erreur lors du chargement de l'agenda")
    }
  }

  return (
    <CoachLayout title="">
      {error && (
        <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      )}

      <h1 className="mb-8 font-display text-3xl font-normal text-brand-tamarillo">
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
        <h2 className="text-xl font-medium capitalize text-brand-brown">{getMonthLabel(currentMonth)}</h2>
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

      <div>
        {selectedAssignments.length === 0 ? (
          <div className="border-t border-[#d98978] py-5 text-sm text-brand-tamarillo">
            Aucune séance prévue pour cette date.
          </div>
        ) : (
          selectedClientGroups.map((clientGroup) => (
            <ClientAgendaBlock
              key={clientGroup.userId}
              clientGroup={clientGroup}
              expanded={expandedClientId === clientGroup.userId}
              onToggle={() => setExpandedClientId((current) => (
                current === clientGroup.userId ? null : clientGroup.userId
              ))}
              onViewProgram={(assignment) => navigate(`/admin/programs/${assignment.program_id}`)}
            />
          ))
        )}
      </div>
    </CoachLayout>
  )
}

export default CoachCalendarPage
