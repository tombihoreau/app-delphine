import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import api from '../services/api'
import SunIcon from '../components/SunIcon'
import HorizontalScrollRow from '../components/HorizontalScrollRow'
import WeeklyMetricChart, { addDays, buildWeekRange, filterWeekData, getWeekStart } from '../components/WeeklyMetricChart'

const EditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const formatJoinDate = (createdAt) => {
  if (!createdAt) return ''
  const date = new Date(createdAt)
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${day}/${month}/${year}`
}

const CoachClientDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [chartWeekStart, setChartWeekStart] = useState(() => getWeekStart())
  const [error, setError] = useState('')

  useEffect(() => {
    loadDetail()
  }, [id])

  const loadDetail = async () => {
    try {
      const response = await api.get(`/api/admin/users/${id}`)
      setDetail(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du client')
    }
  }

  const upcoming = useMemo(() => detail?.upcomingAssignments || [], [detail])
  const history = useMemo(() => detail?.historyAssignments || [], [detail])
  const checkins = useMemo(() => detail?.checkins || [], [detail])
  const weekCheckins = useMemo(
    () => filterWeekData(checkins, chartWeekStart),
    [checkins, chartWeekStart]
  )
  const weekLabel = useMemo(() => buildWeekRange(chartWeekStart).label, [chartWeekStart])
  const previousChartWeek = () => setChartWeekStart((current) => addDays(current, -7))
  const nextChartWeek = () => setChartWeekStart((current) => addDays(current, 7))

  return (
    <CoachLayout headerLabel="Coach_d'1 client" title="" compactBottom>
      {error && <p className="status-banner bg-[#fdeaea] text-danger">{error}</p>}
      {!detail ? (
        <div className="surface-card p-4 text-sm text-muted">Chargement...</div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
          >
            <ChevronLeft />
            Retour
          </button>

          <div className="mb-7 rounded-md bg-brand-peach/50 p-3 text-brand-tamarillo">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <SunIcon className="mt-1 h-7 w-7 shrink-0" />
                <div className="min-w-0">
                  <h1 className="truncate font-display text-2xl font-normal text-brand-tamarillo">
                    {detail.user.name}{detail.user.age ? ` ${detail.user.age} ans` : ''}
                  </h1>
                  <p className="text-xs text-brand-tamarillo">
                    {detail.user.email}{detail.user.phone ? ` • ${detail.user.phone}` : ''}
                  </p>
                  <p className="text-xs text-brand-tamarillo">Depuis {formatJoinDate(detail.user.created_at)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/admin/clients/${id}/edit`)}
                className="shrink-0 text-brand-tamarillo"
                aria-label="Modifier le client"
              >
                <EditIcon />
              </button>
            </div>
          </div>

          <section className="mb-7">
            <h2 className="mb-3 text-base font-normal text-brand-tamarillo">Programmes à venir</h2>
            <HorizontalScrollRow>
              {upcoming.length === 0 ? (
                <div className="min-w-full rounded-md border border-brand-tamarillo/40 p-4 text-sm text-brand-brown">Aucune séance à venir.</div>
              ) : (
                upcoming.slice(0, 4).map((assignment) => (
                  <article key={assignment.id} className="min-w-[78%] rounded-md border border-brand-tamarillo/70 p-3 text-brand-tamarillo">
                    <h3 className="truncate text-sm font-normal">{assignment.program_name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1"><ClockIcon />{assignment.session_minutes || 35} min</span>
                      {assignment.program_category ? <span>{assignment.program_category}</span> : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-brand-tamarillo px-2 py-1 text-[0.65rem]">{assignment.program_category}</span>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/sessions/${assignment.id}`)}
                        className="inline-flex items-center gap-1 text-xs"
                      >
                        Voir la séance <ChevronRight />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </HorizontalScrollRow>
          </section>

          <section className="mb-7">
            <h2 className="mb-3 text-base font-normal text-brand-tamarillo">Ajouter une séance</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin/programs/new')}
                className="rounded-md bg-brand-tamarillo px-5 py-3 text-sm font-bold text-brand-beige"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => navigate(`/admin/clients/${id}/assign`)}
                className="rounded-md border border-brand-tamarillo px-5 py-3 text-sm font-bold text-brand-tamarillo"
              >
                Attribuer
              </button>
            </div>
          </section>

          <WeeklyMetricChart
            title="Mon humeur de la semaine"
            data={weekCheckins}
            type="mood"
            weekLabel={weekLabel}
            onPreviousWeek={previousChartWeek}
            onNextWeek={nextChartWeek}
          />
          <WeeklyMetricChart
            title="Mon niveau de fatigue"
            data={weekCheckins}
            type="energy"
            weekLabel={weekLabel}
            onPreviousWeek={previousChartWeek}
            onNextWeek={nextChartWeek}
          />
          <WeeklyMetricChart
            title="Mon niveau de sommeil"
            data={weekCheckins}
            type="sleep_quality"
            weekLabel={weekLabel}
            onPreviousWeek={previousChartWeek}
            onNextWeek={nextChartWeek}
          />

          <section>
            <h2 className="mb-3 text-base font-normal text-brand-tamarillo">Historique</h2>
            <HorizontalScrollRow>
              {history.length === 0 ? (
                <div className="min-w-full rounded-md border border-brand-tamarillo/40 p-4 text-sm text-brand-brown">Aucun historique pour le moment.</div>
              ) : (
                history.map((assignment) => (
                  <article key={assignment.id} className="min-w-[78%] rounded-md border border-brand-tamarillo/70 p-3 text-brand-tamarillo">
                    <h3 className="truncate text-sm font-normal">{assignment.program_name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1"><ClockIcon />{assignment.session_minutes || 35} min</span>
                      {assignment.program_category ? <span>{assignment.program_category}</span> : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-brand-tamarillo px-2 py-1 text-[0.65rem]">{assignment.program_category}</span>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/sessions/${assignment.id}`)}
                        className="inline-flex items-center gap-1 text-xs"
                      >
                        Voir la séance <ChevronRight />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </HorizontalScrollRow>
          </section>
        </>
      )}
    </CoachLayout>
  )
}

export default CoachClientDetailPage
