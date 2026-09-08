import { useNavigate } from 'react-router-dom'
import { formatSessionVolume } from '../utils/volume'

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
  </svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const formatDate = (value) => value?.split('-').reverse().join('/') || ''

const SessionHistoryCard = ({ assignment, horizontal = false }) => {
  const navigate = useNavigate()

  return (
    <article className={`${horizontal ? 'min-w-[78%]' : 'w-full'} rounded-md border border-brand-tamarillo/70 p-3 text-brand-tamarillo`}>
      <h3 className="truncate text-sm font-light">{assignment.program_name}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1">
          <CalendarIcon />
          {formatDate(assignment.scheduled_date)}
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon />
          {formatSessionVolume(assignment) || '35 Min'}
        </span>
        {assignment.program_category ? <span>{assignment.program_category}</span> : null}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {assignment.program_category ? (
          <span className="rounded-full border border-brand-tamarillo px-2 py-1 text-[0.65rem]">
            {assignment.program_category}
          </span>
        ) : <span />}
        <button
          type="button"
          onClick={() => navigate(`/admin/sessions/${assignment.id}`)}
          className="inline-flex items-center gap-1 text-xs"
        >
          Voir la séance <ChevronRight />
        </button>
      </div>
    </article>
  )
}

export default SessionHistoryCard
