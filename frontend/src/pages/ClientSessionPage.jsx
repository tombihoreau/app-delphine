import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import SunIcon from '../components/SunIcon'
import SessionDetailView from '../components/SessionDetailView'
import flameIcon from '../assets/brand/flamme.svg'

const formatDateKey = (date) => {
  const current = new Date(date)
  const year = current.getFullYear()
  const month = String(current.getMonth() + 1).padStart(2, '0')
  const day = String(current.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const SliderQuestion = ({ title, subtitle, labels, value, onChange }) => (
  <section className="mb-10">
    <h2 className="text-lg font-light text-brand-brown">{title}</h2>
    <p className="mt-1 text-xs italic text-brand-brown/80">{subtitle}</p>
    <div className="mt-8">
      <div className="relative h-5">
        <div className="absolute left-2 right-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-peach" />
        <div className="relative flex justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              className={`h-5 w-5 rounded-full bg-brand-peach ${
                step === value ? 'border-4 border-brand-tamarillo' : 'border-0'
              }`}
              aria-label={`${title} ${step}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2 text-center text-[0.62rem] text-brand-brown">
        {labels.map((label) => <span key={label}>{label}</span>)}
      </div>
    </div>
  </section>
)

const CompletionScreen = ({ onContinue }) => (
  <div className="client-screen">
    <div className="client-frame flex min-h-[calc(100vh-4rem)] flex-col">
      <main className="flex flex-1 flex-col items-center justify-center pb-28 text-center">
        <h1 className="font-display text-3xl font-normal leading-tight text-brand-tamarillo">
          Félicitations !<br />Séance terminé
        </h1>
        <p className="mt-3 text-sm italic text-brand-brown">Ajoute ton ressenti durant la séance</p>
        <img src={flameIcon} alt="" className="mt-16 h-40 w-auto" aria-hidden="true" />
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-full bg-brand-tamarillo px-6 py-4 text-base font-bold text-brand-beige"
          >
            Ajouter mon ressenti
          </button>
        </div>
      </div>
    </div>
  </div>
)

const FeedbackForm = ({ assignment, error, saving, feedback, setFeedback, onSubmit }) => (
  <div className="client-screen">
    <div className="client-frame flex min-h-[calc(100vh-4rem)] flex-col">
      <main className="flex-1 pb-40">
        {error ? <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">{error}</p> : null}
        <h1 className="mb-9 flex items-center gap-2 font-display text-3xl font-normal text-brand-tamarillo">
          <SunIcon className="h-8 w-8" />
          Ressenti rapide
        </h1>
        <SliderQuestion
          title="Effort ressenti"
          subtitle="Sélectionne ton niveau d'effort durant la séance réalisée"
          labels={['Très facile', 'Facile', 'Modéré', 'Difficile', 'Effort maximal']}
          value={feedback.difficulty}
          onChange={(difficulty) => setFeedback({ ...feedback, difficulty })}
        />
        <section className="mb-8">
          <label className="mb-3 block text-lg font-medium text-brand-brown">As-tu ressenti des douleurs ?</label>
          <textarea
            value={feedback.pain_notes}
            onChange={(event) => setFeedback({ ...feedback, pain_notes: event.target.value })}
            placeholder="Ajouter un commentaire"
            className="min-h-[100px] w-full rounded-md border border-brand-brown/35 bg-transparent px-4 py-4 text-sm text-brand-brown placeholder:text-brand-brown/35 outline-none focus:border-brand-tamarillo"
          />
        </section>
        <section>
          <label className="mb-3 block text-lg font-medium text-brand-brown">Un commentaire ?</label>
          <textarea
            value={feedback.comments}
            onChange={(event) => setFeedback({ ...feedback, comments: event.target.value })}
            placeholder="Besoin, aide ..."
            className="min-h-[100px] w-full rounded-md border border-brand-brown/35 bg-transparent px-4 py-4 text-sm text-brand-brown placeholder:text-brand-brown/35 outline-none focus:border-brand-tamarillo"
          />
        </section>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="w-full rounded-full bg-brand-tamarillo px-6 py-4 text-base font-bold text-brand-beige disabled:opacity-60"
          >
            {saving ? 'Envoi...' : 'Envoyer mon retour'}
          </button>
        </div>
      </div>
    </div>
  </div>
)

const ClientSessionPage = () => {
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [screen, setScreen] = useState('detail')
  const [feedback, setFeedback] = useState({
    difficulty: 4,
    pain_notes: '',
    comments: ''
  })

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

  const assignment = detail?.assignment
  const completed = Boolean(assignment?.feedback_id)
  const isFuture = assignment ? assignment.scheduled_date > formatDateKey(new Date()) : false
  const steps = useMemo(() => {
    if (!assignment) return []

    return detail?.steps?.length
      ? detail.steps.map((step) => ({
          ...step,
          duration: step.duration_minutes || 0
        }))
      : []
  }, [assignment, detail])

  const submitFeedback = async () => {
    setSaving(true)
    setError('')
    try {
      await api.post(`/api/client/sessions/${id}/complete`, {
        difficulty: feedback.difficulty,
        pain_notes: feedback.pain_notes,
        comments: feedback.comments,
        duration_minutes: assignment?.session_minutes || 0
      })
      await loadSession()
      setScreen('detail')
    } catch (err) {
      setError('Impossible d’envoyer ton retour')
    } finally {
      setSaving(false)
    }
  }

  if (screen === 'complete') {
    return <CompletionScreen onContinue={() => setScreen('feedback')} />
  }

  if (screen === 'feedback') {
    return (
      <FeedbackForm
        assignment={assignment}
        error={error}
        saving={saving}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmit={submitFeedback}
      />
    )
  }

  const hasFixedAction = assignment && !completed

  return (
    <div className={`client-screen ${hasFixedAction ? '' : '!pb-10'}`}>
      <SessionDetailView
        assignment={assignment}
        steps={steps}
        completed={completed}
        error={error}
        mainClassName={hasFixedAction ? 'pb-40' : 'pb-4'}
        fixedAction={assignment && !completed ? (
          <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
            <div className="mx-auto max-w-md">
              <button
                type="button"
                onClick={() => setScreen('complete')}
                disabled={saving || isFuture}
                aria-describedby={isFuture ? 'future-session-help' : undefined}
                title={isFuture ? 'La séance pourra être validée le jour prévu.' : undefined}
                className={`w-full rounded-full px-6 py-4 text-base font-bold ${
                  isFuture
                    ? 'bg-[#e6dce4] text-brand-brown/45'
                    : 'bg-brand-tamarillo text-brand-beige'
                } disabled:cursor-not-allowed`}
              >
                Valider la séance
              </button>
              {isFuture ? (
                <p id="future-session-help" className="sr-only">
                  La séance pourra être validée le jour prévu.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      />
    </div>
  )
}

export default ClientSessionPage
