import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import api from '../services/api'

const BackIcon = () => (
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

const CoachProgramAssignPage = () => {
  const navigate = useNavigate()
  const { programId } = useParams()
  const [programs, setPrograms] = useState([])
  const [clients, setClients] = useState([])
  const [selectedClientIds, setSelectedClientIds] = useState([])
  const [scheduledDate, setScheduledDate] = useState('')
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

  const toggleClient = (clientId) => {
    setSelectedClientIds((current) =>
      current.includes(clientId)
        ? current.filter((id) => id !== clientId)
        : [...current, clientId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (selectedClientIds.length === 0) {
      setError('Sélectionnez au moins un client')
      return
    }

    setSaving(true)
    try {
      await Promise.all(
        selectedClientIds.map((userId) =>
          api.post('/api/admin/assignments', {
            program_id: programId,
            user_id: userId,
            scheduled_date: scheduledDate,
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
    <CoachLayout title="">
      {error && (
        <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="pb-20">
        <button
          type="button"
          onClick={() => navigate('/admin/programs')}
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

        <div className="space-y-4">
          <div>
            <FieldLabel>Attribuer à ...</FieldLabel>
            <div className="rounded-md border border-brand-brown/35 bg-transparent p-2">
              <div className="mb-2 flex h-[28px] items-center justify-between px-2 text-xs text-brand-brown/45">
                <span>Sélectionner une ou plusieurs clientes</span>
                <SelectArrow />
              </div>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {clients.map((client) => {
                  const selected = selectedClientIds.includes(client.id)
                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => toggleClient(client.id)}
                      className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                        selected
                          ? 'bg-brand-tamarillo text-brand-beige'
                          : 'text-brand-brown hover:bg-brand-peach/40'
                      }`}
                    >
                      {client.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Ajouter la date</FieldLabel>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-beige px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
          <div className="mx-auto max-w-md">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-brand-tamarillo px-5 py-4 text-base font-bold text-brand-beige shadow-float disabled:opacity-60"
            >
              {saving ? 'Attribution...' : 'Valider'}
            </button>
          </div>
        </div>
      </form>
    </CoachLayout>
  )
}

export default CoachProgramAssignPage
