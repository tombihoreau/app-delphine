import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../services/api'
import { coachPrimaryActionClass } from './CoachBottomAction'
import CoachSelect from './CoachSelect'

export const initialProgramStep = {
  name: '',
  duration: '',
  description: ''
}

export const initialProgramForm = {
  name: '',
  session_minutes: '',
  description: '',
  coach_notes: '',
  banner_image: '',
  category: ''
}

const categoryOptions = ['Course à pied', 'Marche', 'Renforcement', 'Mobilité']

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

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
  >
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 14h10l1-14" />
    <path d="M9 7V4h6v3" />
  </svg>
)

const FieldLabel = ({ children, required = false }) => (
  <label className="mb-2 block text-xs text-brand-brown">
    {children}
    {required ? <span className="ml-1 text-brand-tamarillo">*</span> : null}
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

const StepBlock = ({ step, index, onChange, onRemove, canRemove }) => (
  <div className="space-y-4">
    <div className="flex items-end gap-3">
      <p className="shrink-0 italic text-brand-tamarillo">
        Etape {index + 1}
      </p>
      <div className="mb-1 h-px flex-1 bg-[#df9c92]" />
      {canRemove ? (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="mb-[-0.15rem] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-tamarillo transition hover:bg-brand-peach/40"
          aria-label={`Supprimer l'étape ${index + 1}`}
        >
          <TrashIcon />
        </button>
      ) : null}
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

const resizeImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = () => reject(new Error('Lecture impossible'))
  reader.onload = () => {
    const image = new Image()
    image.onerror = () => reject(new Error('Image invalide'))
    image.onload = () => {
      const maxSize = 1400
      const ratio = Math.min(1, maxSize / Math.max(image.width, image.height))
      const width = Math.round(image.width * ratio)
      const height = Math.round(image.height * ratio)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      canvas.width = width
      canvas.height = height
      context.drawImage(image, 0, 0, width, height)

      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    image.src = reader.result
  }
  reader.readAsDataURL(file)
})

const CoachProgramForm = ({
  title,
  form,
  setForm,
  steps,
  setSteps,
  onSubmit,
  submitLabel
}) => {
  const navigate = useNavigate()
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) return

    setUploadingImage(true)
    setUploadError('')

    try {
      const dataUrl = await resizeImage(file)
      const response = await api.post('/api/admin/uploads/program-image', {
        data_url: dataUrl
      })
      setForm((current) => ({ ...current, banner_image: response.data.url || '' }))
    } catch (error) {
      setUploadError(error.response?.data?.error || "Impossible d'ajouter l'image")
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  const updateStep = (index, field, value) => {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [field]: value } : step
      )
    )
  }

  const addStep = () => {
    setSteps((current) => [...current, { ...initialProgramStep }])
  }

  const removeStep = (index) => {
    setSteps((current) =>
      current.length > 1 ? current.filter((_, stepIndex) => stepIndex !== index) : current
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
      >
        <BackIcon />
        Retour
      </button>

      <h1 className="mb-8 font-display text-3xl font-normal text-brand-tamarillo">
        {title}
      </h1>

      <section className="mb-8">
        <h2 className="mb-5 text-xl font-light text-brand-brown">
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
                <span>{uploadingImage ? 'Envoi...' : 'Choisir une image'}</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
              disabled={uploadingImage}
            />
          </label>
          {uploadError ? (
            <p className="mt-2 text-xs text-brand-tamarillo">{uploadError}</p>
          ) : null}
        </div>

        <div className="mb-4">
          <FieldLabel required>Titre du programme</FieldLabel>
          <TextInput
            type="text"
            placeholder="Titre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <FieldLabel required>Durée de la séance en minutes</FieldLabel>
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
          <FieldLabel required>Catégorie de la séance</FieldLabel>
          <CoachSelect
            value={form.category}
            onChange={(category) => setForm({ ...form, category })}
            options={categoryOptions}
            placeholder="Sélectionner une catégorie"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-5 text-xl font-light text-brand-brown">
          Description de la séance
        </h2>

        <div className="space-y-7">
          {steps.map((step, index) => (
            <StepBlock
              key={`step-${index}`}
              step={step}
              index={index}
              onChange={updateStep}
              onRemove={removeStep}
              canRemove={steps.length > 1}
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

      <section className="mb-0">
        <h2 className="mb-5 text-xl font-light text-brand-brown">
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

      <div className="pt-8">
        <button
          type="submit"
          className={coachPrimaryActionClass}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default CoachProgramForm
