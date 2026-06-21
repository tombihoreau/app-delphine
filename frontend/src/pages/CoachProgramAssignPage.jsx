import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import CoachBottomAction, { coachPrimaryActionClass } from '../components/CoachBottomAction'
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
  const [clientsOpen, setClientsOpen] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const clientsDropdownRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!clientsOpen) return undefined

    const handlePointerDown = (event) => {
      if (!clientsDropdownRef.current?.contains(event.target)) {
        setClientsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [clientsOpen])

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

  const selectedClientsLabel = useMemo(() => {
    if (selectedClientIds.length === 0) {
      return 'Sélectionner une ou plusieurs clientes'
    }

    const selectedNames = clients
      .filter((client) => selectedClientIds.includes(client.id))
      .map((client) => client.name)

    if (selectedNames.length <= 2) return selectedNames.join(', ')

    return `${selectedNames.length} clientes sélectionnées`
  }, [clients, selectedClientIds])

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
    <CoachLayout title="" compactBottom>
      {error && (
        <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex min-h-[calc(100vh-7rem)] flex-col">
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

        <div className="space-y-4">
          <div>
            <FieldLabel>Attribuer à ...</FieldLabel>
            <div ref={clientsDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setClientsOpen((open) => !open)}
                className="flex h-[43px] w-full items-center justify-between rounded-md border border-brand-brown/35 bg-transparent px-4 text-left text-sm text-brand-brown outline-none focus:border-brand-tamarillo"
              >
                <span className={`truncate ${selectedClientIds.length ? '' : 'text-brand-brown/35'}`}>
                  {selectedClientsLabel}
                </span>
                <span className={`shrink-0 text-brand-brown/60 transition-transform ${clientsOpen ? '' : 'rotate-180'}`}>
                  <SelectArrow />
                </span>
              </button>

              {clientsOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-44 overflow-y-auto rounded-md border border-brand-brown/25 bg-brand-beige p-2 shadow-float">
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
              ) : null}
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
