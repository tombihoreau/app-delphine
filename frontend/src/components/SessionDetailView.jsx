import MoodSmiley from './MoodSmiley'
import SunIcon from './SunIcon'
import BackButton from './BackButton'

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M4 10h16" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
)

export const formatPrettyDate = (value) => value?.split('-').reverse().join('/')

export const difficultyLabel = (value) => ({
  1: 'Très facile',
  2: 'Facile',
  3: 'Modéré',
  4: 'Difficile',
  5: 'Effort maximal'
}[Number(value)] || 'Modéré')

export const chipStyle = (tone) => {
  if (tone === 'green') return 'border-[#6bbd7d] bg-[#e6f5e7] text-[#3d8a4c]'
  if (tone === 'peach') return 'border-[#d98369] bg-brand-peach/60 text-brand-tamarillo'
  return 'border-[#b9adb4] bg-[#efe9ee] text-[#6c6370]'
}

const SessionHeader = ({ assignment, completed }) => (
  <header className="mb-10">
    <h1 className="font-display text-3xl font-normal leading-tight text-brand-tamarillo">{assignment.program_name}</h1>
    <div className="mt-3 flex flex-wrap gap-3 text-sm text-brand-tamarillo">
      <span className="inline-flex items-center gap-1"><CalendarIcon />{formatPrettyDate(assignment.scheduled_date)}</span>
      <span className="inline-flex items-center gap-1"><ClockIcon />{assignment.session_minutes || 35} min</span>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      {assignment.program_category ? (
        <span className="inline-flex rounded-full border border-brand-tamarillo px-3 py-1 text-sm text-brand-tamarillo">
          {assignment.program_category}
        </span>
      ) : null}
      {completed ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#6bbd7d] bg-[#e6f5e7] px-3 py-1 text-sm text-[#3d8a4c]">
          <CheckIcon />
          Réalisé
        </span>
      ) : null}
    </div>
  </header>
)

const ProgramContent = ({ assignment, steps }) => (
  <>
    <section className="mb-9">
      <h2 className="mb-5 flex items-center gap-3 text-xl font-medium text-brand-brown">
        <SunIcon className="h-8 w-8" />
        Le programme de la séance
      </h2>

      {steps.length ? (
        <div className="space-y-6">
          {steps.map((step) => (
            <article key={step.id || step.name}>
              <div className="mb-2 flex items-end justify-between gap-4 border-b border-brand-tamarillo/35 pb-1 text-brand-tamarillo">
                <h3 className="text-base italic">{step.name}</h3>
                {step.duration ? <span className="shrink-0 text-sm">• {step.duration} min</span> : null}
              </div>
              {step.description ? (
                <p className="text-base leading-6 text-brand-brown">{step.description}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-brand-tamarillo/35 px-4 py-3 text-sm text-brand-brown">
          Aucune étape renseignée.
        </p>
      )}
    </section>

    {assignment.coach_notes ? (
      <section className="relative rounded-md bg-brand-peach/35 p-4">
        <h2 className="font-display text-xl font-normal text-brand-tamarillo">Mes petits conseils</h2>
        <p className="mt-2 pr-10 text-sm leading-5 text-brand-brown">{assignment.coach_notes}</p>
        <MoodSmiley value={5} alt="" className="absolute -right-1 -top-6 h-16 w-16" />
      </section>
    ) : null}
  </>
)

const FeedbackCard = ({ assignment }) => (
  <section className="mt-8 rounded-md border border-brand-tamarillo p-4">
    <p className="mb-4 text-center text-sm italic text-brand-brown">Mon ressenti de la séance</p>

    <div className="divide-y divide-brand-brown/10 text-sm text-brand-tamarillo">
      <div className="flex items-center justify-between gap-3 py-3">
        <span>Effort ressenti</span>
        <span className={`rounded-full border px-3 py-1 text-xs ${chipStyle('peach')}`}>
          {difficultyLabel(assignment.feedback_difficulty)}
        </span>
      </div>
      <div className="py-3">
        <p>Douleurs</p>
        <p className="mt-1 text-xs leading-4 text-brand-brown/80">
          {assignment.feedback_pain_notes || 'Aucune douleur ajoutée'}
        </p>
      </div>
      <div className="py-3">
        <p>Commentaires</p>
        <p className="mt-1 text-xs leading-4 text-brand-brown/80">
          {assignment.feedback_comments || 'Aucun commentaire ajouté'}
        </p>
      </div>
    </div>
  </section>
)

const SessionDetailView = ({
  assignment,
  steps,
  completed,
  error,
  loadingLabel = 'Chargement...',
  fixedAction,
  frameClassName = '',
  mainClassName = '',
  showBackButton = true
}) => (
  <div className={`client-frame flex flex-col ${frameClassName}`}>
    <main className={mainClassName}>
      {error ? (
        <p role="alert" className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      ) : null}

      {!assignment ? (
        <>
          {showBackButton ? <BackButton className="mb-7" /> : null}
          <p className="text-brand-tamarillo">{loadingLabel}</p>
        </>
      ) : (
        <>
          {assignment.banner_image ? (
            <div className="-mx-5 -mt-8 mb-5 h-[230px] w-[calc(100%+2.5rem)] overflow-hidden rounded-b-[18px]">
              <img src={assignment.banner_image} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
          {showBackButton ? <BackButton className="mb-7" /> : null}
          <SessionHeader assignment={assignment} completed={completed} />
          <ProgramContent assignment={assignment} steps={steps} />
          {completed ? <FeedbackCard assignment={assignment} /> : null}
        </>
      )}
    </main>
    {fixedAction}
  </div>
)

export default SessionDetailView
