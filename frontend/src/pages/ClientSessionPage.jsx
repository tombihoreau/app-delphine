import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import MoodSmiley from '../components/MoodSmiley'
import SunIcon from '../components/SunIcon'
import BackButton from '../components/BackButton'

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

const formatPrettyDate = (value) => value?.split('-').reverse().join('/')

const fallbackSteps = [
  {
    name: 'Échauffement rapide',
    duration: 5,
    description: "Marche rapide, quelques rotations d'épaules et de chevilles, respirations profondes."
  },
  {
    name: 'Corps de séance',
    duration: 25,
    description: "Marche rapide, quelques rotations d'épaules et de chevilles, respirations profondes."
  },
  {
    name: 'Récupération',
    duration: 5,
    description: "Marche rapide, quelques rotations d'épaules et de chevilles, respirations profondes."
  }
]

const ClientSessionPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSession()
  }, [id])

  const loadSession = async () => {
    try {
      const response = await api.get(`/api/client/sessions/${id}`)
      setDetail(response.data)
    } catch (err) {
      setError('Impossible de charger la séance')
    }
  }

  const completeSession = async () => {
    setSaving(true)
    setError('')
    try {
      await api.post(`/api/client/sessions/${id}/complete`, {
        difficulty: 2,
        fatigue: 2,
        pain: 1,
        comments: 'Séance validée depuis l’espace client'
      })
      navigate('/progres')
    } catch (err) {
      setError('Impossible de valider la séance')
    } finally {
      setSaving(false)
    }
  }

  const assignment = detail?.assignment
  const steps = detail?.steps?.length ? detail.steps.map((step, index) => ({
    ...step,
    duration: index === 0 || index === detail.steps.length - 1 ? 5 : Math.max(10, (assignment?.session_minutes || 35) - 10)
  })) : fallbackSteps

  return (
    <div className="client-screen">
      <div className="client-frame flex min-h-[calc(100vh-4rem)] flex-col">
        <main className="flex-1 pb-40">
          {error && <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">{error}</p>}

          {!assignment ? (
            <>
              <BackButton className="mb-7" />
              <p className="text-brand-tamarillo">Chargement...</p>
            </>
          ) : (
            <>
              <BackButton className="mb-7" />
              <header className="mb-10">
                <h1 className="font-display text-3xl font-normal leading-tight text-brand-tamarillo">{assignment.program_name}</h1>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-brand-tamarillo">
                  <span className="inline-flex items-center gap-1"><CalendarIcon />{formatPrettyDate(assignment.scheduled_date)}</span>
                  <span className="inline-flex items-center gap-1"><ClockIcon />{assignment.session_minutes || 35} min</span>
                </div>
                <span className="mt-3 inline-flex rounded-full border border-brand-tamarillo px-3 py-1 text-sm text-brand-tamarillo">
                  Course à pied
                </span>
              </header>

              <section className="mb-9">
                <h2 className="mb-5 flex items-center gap-3 text-xl font-medium text-brand-brown">
                  <SunIcon className="h-8 w-8" />
                  Le programme de la séance
                </h2>

                <div className="space-y-6">
                  {steps.map((step) => (
                    <article key={step.id || step.name}>
                      <div className="mb-2 flex items-end justify-between gap-4 border-b border-brand-tamarillo/35 pb-1 text-brand-tamarillo">
                        <h3 className="text-base italic">{step.name}</h3>
                        <span className="shrink-0 text-sm">• {step.duration} min</span>
                      </div>
                      <p className="text-base leading-6 text-brand-brown">
                        {step.description || "Marche rapide, quelques rotations d'épaules et de chevilles, respirations profondes."}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-md bg-brand-peach/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-normal text-brand-tamarillo">Mes petits conseils</h2>
                    <p className="mt-2 text-sm leading-5 text-brand-brown">
                      {assignment.coach_notes || "Écoute ton corps. Si tu as besoin de marcher, marche, c'est une force, pas un échec."}
                    </p>
                  </div>
                  <MoodSmiley value={5} alt="" className="h-14 w-14 shrink-0" />
                </div>
              </section>
            </>
          )}
        </main>

        {assignment ? (
          <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
            <div className="mx-auto max-w-md">
              <button
                type="button"
                onClick={completeSession}
                disabled={saving || assignment.feedback_id}
                className="w-full rounded-full bg-brand-tamarillo px-6 py-4 text-base font-bold text-brand-beige disabled:opacity-60"
              >
                {assignment.feedback_id ? 'Séance validée' : saving ? 'Validation...' : 'Valider la séance'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ClientSessionPage
