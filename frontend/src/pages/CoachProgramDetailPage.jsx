import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import MoodSmiley from '../components/MoodSmiley'
import SunIcon from '../components/SunIcon'
import api from '../services/api'
import { formatSessionVolume, formatStepVolume } from '../utils/volume'

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M4 10h16" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m5 12 4 4L19 6" />
  </svg>
)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getReferenceDate = (assignments) => {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = assignments
    .filter((assignment) => assignment.scheduled_date >= today)
    .sort((first, second) => first.scheduled_date.localeCompare(second.scheduled_date))

  return upcoming[0]?.scheduled_date || assignments[0]?.scheduled_date || ''
}

const CoachProgramDetailPage = () => {
  const navigate = useNavigate()
  const { programId } = useParams()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProgram()
  }, [programId])

  const loadProgram = async () => {
    try {
      const response = await api.get(`/api/admin/programs/${programId}`)
      setDetail(response.data)
    } catch (err) {
      setError('Erreur lors du chargement du programme')
    }
  }

  const program = detail?.program
  const steps = useMemo(() => detail?.steps || [], [detail])
  const assignments = useMemo(() => detail?.assignments || [], [detail])
  const referenceDate = useMemo(() => getReferenceDate(assignments), [assignments])

  return (
    <CoachLayout title="" compactBottom>
      {error && <p className="status-banner bg-[#fdeaea] text-danger">{error}</p>}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-1 text-base text-brand-tamarillo"
      >
        <ChevronLeft />
        Retour
      </button>

      {!program ? (
        <div className="rounded-md border border-brand-tamarillo/30 p-4 text-sm text-brand-tamarillo">
          Chargement...
        </div>
      ) : (
        <>
          <header className="mb-10">
            <h1 className="font-display text-3xl font-normal leading-tight text-brand-tamarillo">
              {program.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-brand-tamarillo">
              {referenceDate ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarIcon />{formatDate(referenceDate)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <ClockIcon />{formatSessionVolume(program) || '35 Min'}
              </span>
            </div>

            {program.category ? (
              <div className="mt-3">
                <span className="inline-flex rounded-full border border-brand-tamarillo px-3 py-1 text-sm text-brand-tamarillo">
                  {program.category}
                </span>
              </div>
            ) : null}
          </header>

          <section className="mb-10">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-light text-brand-brown">
              <SunIcon className="h-9 w-9" />
              Le programme de la séance
            </h2>

            {steps.length === 0 ? (
              <p className="rounded-md border border-brand-tamarillo/30 p-4 text-sm text-brand-brown">
                Aucune étape renseignée.
              </p>
            ) : (
              <div className="space-y-6">
                {steps.map((step) => (
                  <article key={step.id} className="text-brand-brown">
                    <div className="mb-3 flex items-end justify-between gap-4 border-b border-brand-tamarillo/35 pb-1 text-brand-tamarillo">
                      <h3 className="text-lg font-light italic text-[#a53524]">{step.name}</h3>
                      {formatStepVolume(step) ? (
                        <span className="shrink-0 text-base text-[#a53524]">
                          • {formatStepVolume(step)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-base leading-6 text-brand-brown">
                      {step.description || 'Aucune description renseignée.'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="relative mb-10 rounded-md bg-brand-peach/35 px-4 py-4">
            <h2 className="text-xl font-light text-brand-tamarillo">Mes petits conseils</h2>
            <p className="mt-2 pr-10 text-sm leading-5 text-brand-brown">
              {program.coach_notes || 'Aucun conseil renseigné pour ce programme.'}
            </p>
            <MoodSmiley value={5} alt="" className="absolute -right-1 -top-6 h-16 w-16" />
          </section>

          <section>
            <h2 className="mb-6 flex items-center gap-3 text-xl font-light text-brand-brown">
              <SunIcon className="h-9 w-9" />
              Attribution du programme
            </h2>

            {assignments.length === 0 ? (
              <p className="rounded-md border border-brand-tamarillo/30 p-4 text-sm text-brand-brown">
                Ce programme n’a pas encore été attribué.
              </p>
            ) : (
              <div className="divide-y divide-brand-tamarillo/35">
                {assignments.map((assignment) => (
                  <button
                    key={assignment.id}
                    type="button"
                    onClick={() => navigate(`/admin/clients/${assignment.user_id}`)}
                    className="flex w-full items-center justify-between gap-3 py-4 text-left text-brand-tamarillo"
                  >
                    <span className="min-w-0 flex-1 truncate text-xl text-brand-brown">
                      {assignment.user_name}
                      {assignment.feedback_id ? '' : ` - ${formatDate(assignment.scheduled_date)}`}
                    </span>
                    {assignment.feedback_id ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#6bbd7d] bg-[#e6f5e7] px-3 py-1 text-xs text-[#3d8a4c]">
                        <CheckIcon />
                        {formatDate(assignment.scheduled_date)}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate(`/admin/programs/${programId}/assign`)}
              className="mt-5 w-full rounded-md bg-brand-tamarillo px-5 py-3 text-base font-semibold text-brand-beige"
            >
              Attribuer à une nouvelle personne
            </button>
          </section>
        </>
      )}
    </CoachLayout>
  )
}

export default CoachProgramDetailPage
