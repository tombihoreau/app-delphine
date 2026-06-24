import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import SessionHistoryCard from '../components/SessionHistoryCard'
import api from '../services/api'

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const CoachClientHistoryPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const response = await api.get(`/api/admin/users/${id}`)
        setDetail(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur lors du chargement de l’historique')
      }
    }

    loadDetail()
  }, [id])

  const history = useMemo(() => detail?.historyAssignments || [], [detail])

  return (
    <CoachLayout headerLabel="Historique" title="" compactBottom>
      {error && <p className="status-banner bg-[#fdeaea] text-danger">{error}</p>}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
      >
        <ChevronLeft />
        Retour
      </button>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-normal text-brand-tamarillo">
          Historique
        </h1>
        {detail?.user ? (
          <p className="mt-2 text-sm text-brand-brown">
            {detail.user.name}
          </p>
        ) : null}
      </div>

      {!detail ? (
        <div className="surface-card p-4 text-sm text-muted">Chargement...</div>
      ) : history.length === 0 ? (
        <div className="rounded-md border border-brand-tamarillo/40 p-4 text-sm text-brand-brown">
          Aucun historique pour le moment.
        </div>
      ) : (
        <section className="grid gap-3">
          {history.map((assignment) => (
            <SessionHistoryCard key={assignment.id} assignment={assignment} />
          ))}
        </section>
      )}
    </CoachLayout>
  )
}

export default CoachClientHistoryPage
