import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import CoachProgramForm, { initialProgramForm, initialProgramStep } from '../components/CoachProgramForm'
import api from '../services/api'

const CoachProgramEditPage = () => {
  const navigate = useNavigate()
  const { programId } = useParams()
  const [form, setForm] = useState(initialProgramForm)
  const [steps, setSteps] = useState([{ ...initialProgramStep }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgram()
  }, [programId])

  const loadProgram = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get(`/api/admin/programs/${programId}`)
      const program = response.data.program || {}
      const programSteps = response.data.steps || []

      setForm({
        name: program.name || '',
        session_minutes: String(program.session_minutes || ''),
        session_volume_value: String(program.session_volume_value ?? program.session_minutes ?? ''),
        session_volume_unit: program.session_volume_unit || 'minutes',
        description: program.description || '',
        coach_notes: program.coach_notes || '',
        banner_image: program.banner_image || '',
        category: program.category || ''
      })

      setSteps(
        programSteps.length
          ? programSteps.map((step) => ({
              name: step.name || '',
              volume_value: String(step.volume_value ?? step.duration_minutes ?? ''),
              volume_unit: step.volume_unit || 'minutes',
              description: step.description || ''
            }))
          : [{ ...initialProgramStep }]
      )
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du programme')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await api.put(`/api/admin/programs/${programId}`, {
        ...form,
        steps,
        description: steps
          .filter((step) => step.name.trim())
          .map((step) => step.name.trim())
          .join(' • ')
      })

      navigate(`/admin/programs/${programId}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du programme')
    }
  }

  return (
    <CoachLayout headerLabel="Programmes" title="" compactBottom>
      {error && (
        <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-brand-brown">Chargement...</p>
      ) : (
        <CoachProgramForm
          title="Modifier le programme"
          form={form}
          setForm={setForm}
          steps={steps}
          setSteps={setSteps}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer"
        />
      )}
    </CoachLayout>
  )
}

export default CoachProgramEditPage
