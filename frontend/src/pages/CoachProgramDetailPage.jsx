import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import api from '../services/api'

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
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

const formatDate = (date) => {
  if (!date) return ''
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
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

  return (
    <CoachLayout title="" compactBottom>
      {error && <p className="status-banner bg-[#fdeaea] text-danger">{error}</p>}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
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
          <header className="mb-7">
            {program.banner_image ? (
              <img
                src={program.banner_image}
                alt=""
                className="mb-5 h-40 w-full rounded-md object-cover"
              />
            ) : null}

            <h1 className="font-display text-3xl font-normal leading-tight text-brand-tamarillo">
              {program.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-brand-tamarillo">
	              <span className="inline-flex items-center gap-1 rounded-full border border-brand-tamarillo px-3 py-1">
	                {program.category}
	              </span>
	              <span className="inline-flex items-center gap-1 rounded-full border border-brand-tamarillo px-3 py-1">
	                <ClockIcon />{program.session_minutes || 35} min
	              </span>
	            </div>
          </header>

	          <section className="mb-8 rounded-md bg-brand-peach/45 p-4">
	            <h2 className="font-display text-xl font-normal text-brand-tamarillo">Les conseils</h2>
	            <p className="mt-2 text-sm leading-5 text-brand-brown">
	              {program.coach_notes || 'Aucun conseil renseigné pour ce programme.'}
	            </p>
	          </section>

	          <button
	            type="button"
	            onClick={() => navigate(`/admin/programs/${programId}/assign`)}
	            className="mb-8 w-full rounded-full bg-brand-tamarillo px-5 py-4 text-lg font-bold text-brand-beige shadow-float"
	          >
	            Attribuer le programme
	          </button>

	          <section className="mb-8">
            <h2 className="mb-4 text-lg font-normal text-brand-tamarillo">Description de la séance</h2>
            <div className="space-y-5">
              {steps.length === 0 ? (
                <p className="rounded-md border border-brand-tamarillo/30 p-4 text-sm text-brand-brown">
                  Aucune étape renseignée.
                </p>
              ) : (
                steps.map((step, index) => (
                  <article key={step.id} className="text-brand-brown">
                    <div className="mb-2 flex items-end gap-3">
                      <h3 className="shrink-0 italic text-brand-tamarillo">Etape {index + 1}</h3>
                      <div className="mb-1 h-px flex-1 bg-[#df9c92]" />
                    </div>
                    <p className="font-medium">{step.name}</p>
                    <p className="mt-1 text-sm leading-5 text-brand-brown/75">
                      {step.description || 'Aucune description renseignée.'}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-normal text-brand-tamarillo">Dernières attributions</h2>
            <div className="space-y-3">
              {assignments.length === 0 ? (
                <p className="rounded-md border border-brand-tamarillo/30 p-4 text-sm text-brand-brown">
                  Ce programme n’a pas encore été attribué.
                </p>
              ) : (
                assignments.map((assignment) => (
                  <button
                    key={assignment.id}
                    type="button"
                    onClick={() => navigate(`/admin/clients/${assignment.user_id}`)}
                    className="w-full rounded-md border border-brand-tamarillo/50 p-3 text-left text-brand-tamarillo"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base text-brand-brown">{assignment.user_name}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs">
                          <CalendarIcon />{formatDate(assignment.scheduled_date)}
                        </p>
                      </div>
                      {assignment.feedback_id ? (
                        <span className="rounded-full border border-[#58a56d] bg-[#e8f7ea] px-3 py-1 text-xs text-[#34824a]">
                          Réalisé
                        </span>
                      ) : (
                        <span className="rounded-full border border-brand-tamarillo px-3 py-1 text-xs">
                          Prévu
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </CoachLayout>
  )
}

export default CoachProgramDetailPage
