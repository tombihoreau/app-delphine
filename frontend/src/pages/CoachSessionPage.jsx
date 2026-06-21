import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import SessionDetailView from '../components/SessionDetailView'

const CoachSessionPage = () => {
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSession = async () => {
      setError('')
      try {
        const response = await api.get(`/api/admin/assignments/${id}`)
        setDetail(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Impossible de charger la séance')
      }
    }

    loadSession()
  }, [id])

  const assignment = detail?.assignment
  const completed = Boolean(assignment?.feedback_id)
  const steps = useMemo(() => (
    detail?.steps?.map((step) => ({
      ...step,
      duration: step.duration_minutes || 0
    })) || []
  ), [detail])

  return (
    <div className="client-screen !pb-10">
      <SessionDetailView
        assignment={assignment}
        steps={steps}
        completed={completed}
        error={error}
        mainClassName="pb-4"
      />
    </div>
  )
}

export default CoachSessionPage
