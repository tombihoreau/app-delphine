import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import CoachBottomAction, { coachPrimaryActionClass } from '../components/CoachBottomAction'
import api from '../services/api'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const SelectArrow = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m6 15 6-6 6 6" />
  </svg>
)

const FieldLabel = ({ children }) => (
  <label className="mb-2 block text-xs text-brand-brown">
    {children}
  </label>
)

const fieldClass = 'h-[43px] w-full rounded-md border border-brand-brown/35 bg-transparent px-4 text-sm text-brand-brown placeholder:text-brand-brown/35 outline-none focus:border-brand-tamarillo'

const getTodayKey = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const CoachAssignSessionPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [programs, setPrograms] = useState([])
  const [form, setForm] = useState({
    program_id: '',
    scheduled_date: '',
    start_time: '',
    end_time: '',
    notes: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const response = await api.get('/api/admin/programs')
      setPrograms(response.data)
    } catch (err) {
      setError('Erreur lors du chargement des programmes')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.scheduled_date < getTodayKey()) {
      setError("La date d'attribution ne peut pas être passée")
      return
    }

    try {
      await api.post('/api/admin/assignments', {
        ...form,
        start_time: form.start_time || '09:00',
        end_time: form.end_time || '10:00',
        user_id: id
      })
      navigate(`/admin/clients/${id}`)
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'attribution")
    }
  }

  return (
    <CoachLayout headerLabel="Coach_ajout programme" title="" compactBottom>
      {error && <p className="status-banner bg-[#fdeaea] text-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="flex min-h-[calc(100vh-5rem)] flex-col">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
        >
          <ArrowLeft />
          Retour
        </button>

        <h1 className="mb-7 font-display text-3xl font-normal text-brand-tamarillo">
          Attribuer la séance
        </h1>

        <div className="space-y-4">
          <div>
            <FieldLabel>Séances déjà créées</FieldLabel>
            <div className="relative">
              <select
                value={form.program_id}
                onChange={(e) => setForm({ ...form, program_id: e.target.value })}
                className={`${fieldClass} appearance-none pr-12`}
                required
              >
                <option value="">Programme Course</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-brown/60">
                <SelectArrow />
              </span>
            </div>
          </div>

          <div>
            <FieldLabel>Ajouter la date</FieldLabel>
            <input
              type="date"
              min={getTodayKey()}
              value={form.scheduled_date}
              onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
              className={fieldClass}
              required
            />
          </div>

          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            className="hidden"
          />
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            className="hidden"
          />
        </div>

        <CoachBottomAction>
          <button type="submit" className={coachPrimaryActionClass}>
            Valider
          </button>
        </CoachBottomAction>
      </form>
    </CoachLayout>
  )
}

export default CoachAssignSessionPage
