import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import api from '../services/api'

const initialStep = {
  name: '',
  duration: '',
  description: ''
}

const BackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const ImageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6 text-[#ff8f85]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <path d="m8 16 3-3 2 2 2.5-3 2.5 4" />
    <circle cx="9" cy="9" r="1" />
  </svg>
)

const SelectArrow = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="m6 15 6-6 6 6" />
  </svg>
)

const FieldLabel = ({ children }) => (
  <label className="mb-2 block text-xs text-brand-brown">
    {children}
  </label>
)

const TextInput = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`h-[43px] w-full rounded-md border border-brand-brown/35 bg-transparent px-4 text-sm text-brand-brown placeholder:text-brand-brown/35 outline-none focus:border-brand-tamarillo ${className}`}
  />
)

const TextArea = ({ className = '', ...props }) => (
  <textarea
    {...props}
    className={`w-full rounded-md border border-brand-brown/35 bg-transparent px-4 py-4 text-sm text-brand-brown placeholder:text-brand-brown/35 outline-none focus:border-brand-tamarillo ${className}`}
  />
)

const StepBlock = ({ step, index, onChange }) => (
  <div className="space-y-4">
    <div className="flex items-end gap-3">
      <p className="shrink-0 italic text-brand-tamarillo">
        Etape {index + 1}
      </p>
      <div className="mb-1 h-px flex-1 bg-[#df9c92]" />
    </div>

    <div>
      <FieldLabel>Titre de l'étape</FieldLabel>
      <TextInput
        type="text"
        placeholder="Titre"
        value={step.name}
        onChange={(e) => onChange(index, 'name', e.target.value)}
      />
    </div>

    <div>
      <FieldLabel>Durée de l'étape en minutes</FieldLabel>
      <TextInput
        type="number"
        min="1"
        step="1"
        inputMode="numeric"
        placeholder="Ex : 10"
        value={step.duration}
        onChange={(e) => onChange(index, 'duration', e.target.value)}
      />
    </div>

    <div>
      <FieldLabel>Description de l'étape</FieldLabel>
      <TextArea
        placeholder="Contenu, explications..."
        value={step.description}
        onChange={(e) => onChange(index, 'description', e.target.value)}
        className="min-h-[120px]"
      />
    </div>
  </div>
)

const CoachProgramCreatePage = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    session_minutes: '',
    duration_weeks: '1',
    description: '',
    coach_notes: '',
    banner_image: '',
    goal: '',
    level: 'débutant',
    location: 'Domicile'
  })

  const [steps, setSteps] = useState([
    { ...initialStep },
    { ...initialStep }
  ])

  const [error, setError] = useState('')
  const [createdProgram, setCreatedProgram] = useState(null)

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, banner_image: reader.result || '' }))
    }
    reader.readAsDataURL(file)
  }

  const updateStep = (index, field, value) => {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [field]: value } : step
      )
    )
  }

  const addStep = () => {
    setSteps((current) => [...current, { ...initialStep }])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.post('/api/admin/programs', {
        ...form,
        steps,
        description: steps
          .filter((step) => step.name.trim())
          .map((step) => step.name.trim())
          .join(' • ')
      })

      setCreatedProgram(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du programme')
    }
  }

  return (
    <CoachLayout headerLabel="Programmes" title="">
      {error && (
        <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="pb-20">
        <button
          type="button"
          onClick={() => navigate('/admin/programs')}
          className="mb-6 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
        >
          <BackIcon />
          Retour
        </button>

        <h1 className="mb-8 font-display text-3xl font-normal text-brand-tamarillo">
          Ajouter un programme
        </h1>

        <section className="mb-8">
          <h2 className="mb-5 text-xl font-normal text-brand-brown">
            Paramètre de la séance
          </h2>

          <div className="mb-5">
            <FieldLabel>Ajouter une illustration</FieldLabel>

            <label className="relative flex h-[120px] w-[145px] cursor-pointer items-center justify-center overflow-hidden rounded-md bg-brand-peach/60 transition hover:bg-brand-peach/80">
              {form.banner_image ? (
                <img
                  src={form.banner_image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-xs text-brand-tamarillo">
                  <ImageIcon />
                  <span>Choisir une image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          </div>

          <div className="mb-4">
            <FieldLabel>Titre du programme</FieldLabel>
            <TextInput
              type="text"
              placeholder="Titre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <FieldLabel>Durée de la séance en minutes</FieldLabel>
            <TextInput
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="Ex : 35"
              value={form.session_minutes}
              onChange={(e) => setForm({ ...form, session_minutes: e.target.value })}
              required
            />
          </div>

          <div>
            <FieldLabel>Catégorie de la séance</FieldLabel>

            <div className="relative">
              <select
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className="h-[43px] w-full appearance-none rounded-md border border-brand-brown/35 bg-transparent px-4 pr-12 text-sm text-brand-brown outline-none focus:border-brand-tamarillo"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Course à pied">Course à pied</option>
                <option value="Marche">Marche</option>
                <option value="Renforcement">Renforcement</option>
                <option value="Mobilité">Mobilité</option>
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-brown/60">
                <SelectArrow />
              </span>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-5 text-xl font-normal text-brand-brown">
            Description de la séance
          </h2>

          <div className="space-y-7">
            {steps.map((step, index) => (
              <StepBlock
                key={`step-${index}`}
                step={step}
                index={index}
                onChange={updateStep}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addStep}
            className="mt-6 w-full rounded-md bg-brand-tamarillo px-5 py-3 text-sm font-semibold text-brand-beige"
          >
            Ajouter une étape
          </button>
        </section>

        <section className="mb-4">
          <h2 className="mb-5 text-xl font-normal text-brand-brown">
            Les conseils
          </h2>

          <div>
            <FieldLabel>Description des conseils</FieldLabel>
            <TextArea
              placeholder="Conseil, motivation..."
              value={form.coach_notes}
              onChange={(e) => setForm({ ...form, coach_notes: e.target.value })}
              className="min-h-[120px]"
            />
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-beige px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
          <div className="mx-auto max-w-md">
            <button
              type="submit"
              className="w-full rounded-full bg-brand-tamarillo px-5 py-5 text-lg font-bold text-brand-beige shadow-float"
            >
              Ajouter le programme
            </button>
          </div>
        </div>
      </form>

      {createdProgram ? (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/35">
          <div className="w-full rounded-t-[28px] bg-brand-beige px-6 pb-10 pt-9 text-center shadow-float">
            <div className="mx-auto max-w-md">
              <p className="mx-auto max-w-[270px] text-base leading-5 text-brand-brown">
                Souhaitez-vous attribuer le programme à un ou plusieurs clients ?
              </p>
              <button
                type="button"
                onClick={() => navigate(`/admin/programs/${createdProgram.id}/assign`)}
                className="mt-9 w-full rounded-md bg-brand-tamarillo px-5 py-4 text-base font-bold text-brand-beige"
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/programs')}
                className="mt-4 w-full rounded-md border border-brand-tamarillo px-5 py-4 text-base font-bold text-brand-tamarillo"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </CoachLayout>
  )
}

export default CoachProgramCreatePage
