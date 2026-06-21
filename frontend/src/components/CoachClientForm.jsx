import { useNavigate } from 'react-router-dom'
import CoachLayout from './CoachLayout'
import CoachBottomAction, { coachPrimaryActionClass } from './CoachBottomAction'

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

const CoachClientForm = ({ title, form, setForm, error, onSubmit, submitLabel = 'Valider' }) => {
  const navigate = useNavigate()

  return (
    <CoachLayout title="" compactBottom>
      {error && <p className="status-banner bg-[#fdeaea] text-danger">{error}</p>}

      <form onSubmit={onSubmit} className="flex min-h-[calc(100vh-7rem)] flex-col">
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
        </div>

        <CoachBottomAction>
          <button type="submit" className={coachPrimaryActionClass}>
            {submitLabel}
          </button>
        </CoachBottomAction>
      </form>
    </CoachLayout>
  )
}

export default CoachClientForm
