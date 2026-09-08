import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import CoachBottomAction, { coachPrimaryActionClass } from '../components/CoachBottomAction'
import CoachSelect from '../components/CoachSelect'
import api from '../services/api'

const BackIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 14h10l1-14" />
    <path d="M9 7V4h6v3" />
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

const initialAssignment = {
  client_id: '',
  scheduled_date: ''
}

const AssignmentBlock = ({
  assignment,
  index,
  clients,
  onChange,
  onRemove,
  canRemove
}) => (
  <div className="space-y-4">
    <div className="flex items-end gap-3">
      <p className="shrink-0 italic text-brand-tamarillo">
        Client {index + 1}
      </p>
      <div className="mb-1 h-px flex-1 bg-[#df9c92]" />
      {canRemove ? (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="mb-[-0.15rem] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-tamarillo transition hover:bg-brand-peach/40"
          aria-label={`Supprimer le client ${index + 1}`}
        >
          <TrashIcon />
        </button>
      ) : null}
    </div>

    <div>
      <FieldLabel>Attribuer à ...</FieldLabel>
      <CoachSelect
        value={assignment.client_id}
        onChange={(clientId) => onChange(index, 'client_id', String(clientId))}
        options={clients}
        placeholder="Sélectionner un client"
        getOptionLabel={(client) => client.name}
        getOptionValue={(client) => client.id}
      />
    </div>

    <div>
      <FieldLabel>Ajouter la date</FieldLabel>
      <input
        type="date"
        min={getTodayKey()}
        value={assignment.scheduled_date}
        onChange={(e) => onChange(index, 'scheduled_date', e.target.value)}
        className={fieldClass}
        required
      />
    </div>
  </div>
)

const CoachProgramAssignPage = () => {
  const navigate = useNavigate()
  const { programId } = useParams()
  const [programs, setPrograms] = useState([])
  const [clients, setClients] = useState([])
  const [assignments, setAssignments] = useState([{ ...initialAssignment }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [programsResponse, clientsResponse] = await Promise.all([
        api.get('/api/admin/programs'),
        api.get('/api/admin/users')
      ])
      setPrograms(programsResponse.data || [])
      setClients(clientsResponse.data || [])
    } catch (err) {
      setError('Erreur lors du chargement des données')
    }
  }

  const selectedProgram = useMemo(
    () => programs.find((program) => String(program.id) === String(programId)),
    [programs, programId]
  )

  const updateAssignment = (index, field, value) => {
    setAssignments((current) =>
      current.map((assignment, assignmentIndex) =>
        assignmentIndex === index ? { ...assignment, [field]: value } : assignment
      )
    )
  }

  const addAssignment = () => {
    setAssignments((current) => [...current, { ...initialAssignment }])
  }

  const removeAssignment = (index) => {
    setAssignments((current) =>
      current.length > 1
        ? current.filter((_, assignmentIndex) => assignmentIndex !== index)
        : current
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const completedAssignments = assignments.filter(
      (assignment) => assignment.client_id && assignment.scheduled_date
    )

    if (completedAssignments.length !== assignments.length) {
      setError('Sélectionnez un client et une date pour chaque attribution')
      return
    }

    if (completedAssignments.some((assignment) => assignment.scheduled_date < getTodayKey())) {
      setError("La date d'attribution ne peut pas être passée")
      return
    }

    setSaving(true)
    try {
      await Promise.all(
        completedAssignments.map((assignment) =>
          api.post('/api/admin/assignments', {
            program_id: programId,
            user_id: assignment.client_id,
            scheduled_date: assignment.scheduled_date,
            start_time: '09:00',
            end_time: '10:00',
            notes: ''
          })
        )
      )
      navigate('/admin/programs')
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'attribution")
    } finally {
      setSaving(false)
    }
  }

  return (
    <CoachLayout title="" compactBottom>
      {error && (
        <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex min-h-[calc(100vh-5rem)] flex-col">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
        >
          <BackIcon />
          Retour
        </button>

        <h1 className="mb-7 font-display text-3xl font-normal text-brand-tamarillo">
          Attribuer la séance
        </h1>

        <p className="mb-6 text-base text-brand-brown">
          {selectedProgram?.name || 'Programme'}
        </p>

        <div className="space-y-7">
          {assignments.map((assignment, index) => (
            <AssignmentBlock
              key={`assignment-${index}`}
              assignment={assignment}
              index={index}
              clients={clients}
              onChange={updateAssignment}
              onRemove={removeAssignment}
              canRemove={assignments.length > 1}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addAssignment}
          className="mt-6 w-full rounded-md bg-brand-tamarillo px-5 py-3 text-sm font-semibold text-brand-beige"
        >
          Ajouter un client
        </button>

        <CoachBottomAction>
          <button
            type="submit"
            disabled={saving}
            className={coachPrimaryActionClass}
          >
            {saving ? 'Attribution...' : 'Valider'}
          </button>
        </CoachBottomAction>
      </form>
    </CoachLayout>
  )
}

export default CoachProgramAssignPage
