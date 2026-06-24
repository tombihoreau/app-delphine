import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import CoachProgramForm, { initialProgramForm, initialProgramStep } from '../components/CoachProgramForm'
import api from '../services/api'

const CoachProgramCreatePage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialProgramForm)
  const [steps, setSteps] = useState([{ ...initialProgramStep }])
  const [error, setError] = useState('')
  const [createdProgram, setCreatedProgram] = useState(null)

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
      window.sessionStorage.setItem('coachProgramsSuccess', 'Programme ajouté')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du programme')
    }
  }

  return (
    <CoachLayout headerLabel="Programmes" title="" compactBottom>
      {error && (
        <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      )}

      <CoachProgramForm
        title="Ajouter un programme"
        form={form}
        setForm={setForm}
        steps={steps}
        setSteps={setSteps}
        onSubmit={handleSubmit}
        submitLabel="Ajouter le programme"
      />

      {createdProgram ? (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/35">
          <div className="w-full rounded-t-[28px] bg-brand-beige px-10 pb-10 pt-9 text-center shadow-float">
            <div className="mx-auto max-w-[360px]">
              <p className="mx-auto max-w-[360px] text-lg leading-6 text-brand-tamarillo">
                Souhaitez-vous attribuer le programme à un ou plusieurs clients ?
              </p>
              <button
                type="button"
                onClick={() => navigate(`/admin/programs/${createdProgram.id}/assign`)}
                className="mt-9 w-full rounded-md bg-brand-tamarillo px-5 py-4 text-lg font-bold text-brand-beige"
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/programs', { state: { success: 'Programme ajouté' } })}
                className="mt-4 w-full rounded-md border border-brand-tamarillo px-5 py-4 text-lg font-bold text-brand-tamarillo"
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
