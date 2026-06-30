import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import CoachLayout from './CoachLayout'
import { coachPrimaryActionClass } from './CoachBottomAction'

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

const SelectArrow = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m6 15 6-6 6 6" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="m5 12 4 4 10-10" />
  </svg>
)

const CoachClientForm = ({ title, form, setForm, error, onSubmit, submitLabel = 'Valider' }) => {
  const navigate = useNavigate()
  const [offerOpen, setOfferOpen] = useState(false)

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
            <div className="relative">
              <button
                type="button"
                onClick={() => setOfferOpen((open) => !open)}
                className={`flex h-[43px] w-full items-center justify-between rounded-md border px-4 text-left text-sm outline-none transition ${
                  offerOpen
                    ? 'border-brand-tamarillo text-brand-brown'
                    : 'border-brand-brown/35 text-brand-brown'
                }`}
              >
                <span className={form.offer_type ? 'truncate' : 'truncate text-brand-brown/35'}>
                  {form.offer_type || 'Sélectionner un type d’offre'}
                </span>
                <span className={`shrink-0 text-brand-brown/60 transition-transform ${offerOpen ? '' : 'rotate-180'}`}>
                  <SelectArrow />
                </span>
              </button>

              {offerOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-56 overflow-y-auto rounded-md border border-brand-tamarillo/35 bg-brand-beige p-2 shadow-float">
                  {offerTypes.map((offerType) => {
                    const selected = offerType === form.offer_type

                    return (
                      <button
                        key={offerType}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, offer_type: offerType })
                          setOfferOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition ${
                          selected
                            ? 'bg-brand-tamarillo text-brand-beige'
                            : 'text-brand-brown hover:bg-brand-peach/40'
                        }`}
                      >
                        <span>{offerType}</span>
                        {selected ? <span className="ml-3 shrink-0"><CheckIcon /></span> : null}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
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
