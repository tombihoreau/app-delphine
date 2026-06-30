import { useNavigate } from 'react-router-dom'
import CoachLayout from './CoachLayout'
import { coachPrimaryActionClass } from './CoachBottomAction'
import CoachSelect from './CoachSelect'

const BackIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const FieldLabel = ({ children }) => (
  <label className="mb-2 block text-xs text-brand-brown">
    {children}
  </label>
)

const fieldClass = 'h-[43px] w-full rounded-md border border-brand-brown/35 bg-transparent px-4 text-sm text-brand-brown placeholder:text-brand-brown/35 outline-none focus:border-brand-tamarillo'
const offerTypes = ['Type d’offre 1', 'Type d’offre 2', 'Type d’offre 3']

const CoachClientForm = ({ title, form, setForm, error, onSubmit, submitLabel = 'Valider' }) => {
  const navigate = useNavigate()

  return (
    <CoachLayout title="" compactBottom>
      {error && <p className="status-banner bg-[#fdeaea] text-danger">{error}</p>}

      <form onSubmit={onSubmit} className="pb-28">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
        >
          <BackIcon />
          Retour
        </button>

        <h1 className="mb-7 font-display text-3xl font-normal text-brand-tamarillo">
          {title}
        </h1>

        <div className="space-y-4">
          <div>
            <FieldLabel>Mail</FieldLabel>
            <input
              type="email"
              placeholder="nom@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <FieldLabel>Nom</FieldLabel>
            <input
              type="text"
              placeholder="Nom"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <FieldLabel>Prénom</FieldLabel>
            <input
              type="text"
              placeholder="Prénom"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <FieldLabel>Téléphone</FieldLabel>
            <input
              type="tel"
              placeholder="01 02 03 04 05"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div>
            <FieldLabel>Date de naissance</FieldLabel>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <FieldLabel>Type d'offre</FieldLabel>
            <CoachSelect
              value={form.offer_type}
              onChange={(offerType) => setForm({ ...form, offer_type: offerType })}
              options={offerTypes}
              placeholder="Sélectionner un type d’offre"
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          <div className="mx-auto w-full max-w-[624px]">
            <button type="submit" className={coachPrimaryActionClass}>
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </CoachLayout>
  )
}

export default CoachClientForm
