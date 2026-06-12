import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import api from '../services/api'
import MoodSmiley from '../components/MoodSmiley'
import SunIcon from '../components/SunIcon'

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

const LocationPin = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 10.5 12 5l7 5.5V19H5z" />
    <path d="M9.5 19v-5h5v5" />
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

const chartLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sa', 'Di']

const buildPath = (values) => {
  if (!values.length) return ''
  const width = 260
  const height = 120
  const stepX = values.length === 1 ? 0 : width / (values.length - 1)
  const points = values.map((value, index) => {
    const x = index * stepX
    const y = height - ((value - 1) / 4) * (height - 10) - 5
    return [x, y]
  })
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
}

const getWeekdayIndex = (dateKey) => {
  const day = new Date(`${dateKey}T12:00:00`).getDay()
  return day === 0 ? 6 : day - 1
}

const buildMoodPoints = (data) => {
  const width = 320
  const paddingX = 22
  const topCenter = 65
  const bottomCenter = 265
  const stepY = (bottomCenter - topCenter) / 4
  const stepX = (width - paddingX * 2) / 6

  return data
    .filter((item) => typeof item.mood === 'number' && item.checkin_date)
    .map((item) => {
      const dayIndex = getWeekdayIndex(item.checkin_date)
      return {
        value: item.mood,
        dayIndex,
        x: paddingX + dayIndex * stepX,
        y: bottomCenter - (item.mood - 1) * stepY
      }
    })
    .sort((a, b) => a.dayIndex - b.dayIndex)
}

const moodGridLines = [90, 140, 190, 240]

const buildSmoothPath = (points) => {
  if (!points.length) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`

    const previous = points[index - 1]
    const midX = (previous.x + point.x) / 2
    return `${path} Q ${previous.x} ${previous.y} ${midX} ${(previous.y + point.y) / 2} T ${point.x} ${point.y}`
  }, '')
}

const lineColor = (type) => {
  if (type === 'mood') return '#9AD15B'
  if (type === 'energy') return '#c5c2bc'
  if (type === 'sleep_quality') return '#bdb9b3'
  return '#c5c2bc'
}

const MetricChart = ({ title, data, type }) => {
  const values = data.map((item) => item[type]).filter((value) => typeof value === 'number')

  if (type === 'mood') {
    const points = buildMoodPoints(data)

    return (
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between text-brand-tamarillo">
          <button type="button" aria-label="Semaine précédente"><ChevronLeft /></button>
          <div className="text-center">
            <h2 className="text-base font-normal">{title}</h2>
            <p className="mt-1 text-[0.68rem] text-brand-tamarillo/80">12/05/2026 au 19/05/2026</p>
          </div>
          <button type="button" aria-label="Semaine suivante"><ChevronRight /></button>
        </div>
        <div className="p-0">
          <div className="relative h-[315px]">
            {moodGridLines.map((lineTop) => (
              <div key={lineTop} className="absolute left-0 right-0 border-t border-brand-brown/10" style={{ top: 20 + lineTop }} />
            ))}
            <svg viewBox="0 0 320 290" className="absolute inset-x-0 top-5 mx-auto h-[300px] w-full max-w-[320px]">
              <path d={buildSmoothPath(points)} fill="none" stroke="rgba(57,6,0,0.18)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-x-0 top-0 mx-auto h-[290px] w-full max-w-[320px]">
              {points.map((point) => {
                const top = point.y - 20
                return (
                  <MoodSmiley
                    key={`${title}-${point.dayIndex}-${point.value}`}
                    value={point.value}
                    alt=""
                    variant="chart"
                    className="absolute h-10 w-10"
                    style={{ top, left: point.x - 20 }}
                  />
                )
              })}
            </div>
            <div className="absolute inset-x-0 bottom-6 mx-auto grid w-full max-w-[320px] grid-cols-7 text-center text-[0.68rem] text-brand-brown">
              {chartLabels.map((label) => <span key={`${title}-${label}`}>{label}</span>)}
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-x-2 gap-y-1 text-[0.58rem] text-brand-tamarillo">
              <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#ffd84f]" />Très bien</span>
              <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#83d7a4]" />Bien</span>
              <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#eee7ec]" />Neutre</span>
              <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#b8bbff]" />Fatigué</span>
              <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#f18a6d]" />En colère</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between text-brand-tamarillo">
        <button type="button" aria-label="Semaine précédente"><ChevronLeft /></button>
        <div className="text-center">
          <h2 className="text-base font-normal">{title}</h2>
          <p className="mt-1 text-[0.68rem] text-brand-tamarillo/80">12/05/2026 au 19/05/2026</p>
        </div>
        <button type="button" aria-label="Semaine suivante"><ChevronRight /></button>
      </div>
      <div className="p-0">
        <div className="relative h-[210px] pl-7">
          {[1, 2, 3, 4, 5].map((value, index) => (
            <div key={`${title}-${value}`} className="absolute left-7 right-0 border-t border-brand-brown/10" style={{ top: `${index * 25}%` }}>
              <span className="sr-only">{6 - value}</span>
            </div>
          ))}
          <svg viewBox="0 0 260 130" className="absolute inset-x-0 top-5 mx-auto h-[150px] w-[260px]">
            <path d={buildPath(values)} fill="none" stroke={lineColor(type)} strokeWidth="1.8" />
            {values.map((value, index) => {
              const x = values.length === 1 ? 0 : (260 / (values.length - 1)) * index
              const y = 120 - ((value - 1) / 4) * 110 - 5
              return <circle key={`${title}-${index}`} cx={x} cy={y} r="3" fill="#d4d1cb" />
            })}
          </svg>
          <div className="absolute inset-x-0 bottom-6 mx-auto grid w-[260px] grid-cols-7 text-center text-[0.68rem] text-brand-brown">
            {chartLabels.map((label) => <span key={`${title}-${label}`}>{label}</span>)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-x-2 gap-y-1 text-[0.58rem] text-brand-tamarillo">
            {type === 'energy' ? (
              <>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#ffd84f]" />Energique</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#83d7a4]" />En forme</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#e7dfed]" />Moyen</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#b8bbff]" />Fatigué</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#f18a6d]" />Très fatigué</span>
              </>
            ) : (
              <>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#ffd84f]" />Excellent</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#83d7a4]" />Bon</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#e7dfed]" />Moyen</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#b8bbff]" />Mauvais</span>
                <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#f18a6d]" />Très mauvais</span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const CoachClientDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
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

  return (
    <CoachLayout headerLabel="Coach_d'1 client" title="">
      {error && <p className="status-banner bg-[#fdeaea] text-danger">{error}</p>}
      {!detail ? (
        <div className="surface-card p-4 text-sm text-muted">Chargement...</div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => navigate('/admin/clients')}
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
                  <p className="mt-1 text-xs text-brand-tamarillo">{detail.user.offer_type || 'Type d’offre'}</p>
                  <p className="text-xs text-brand-tamarillo">Depuis {formatJoinDate(detail.user.created_at)}</p>
                </div>
              </div>
              <button type="button" className="shrink-0 text-brand-tamarillo" aria-label="Modifier le client">
                <EditIcon />
              </button>
            </div>
          </div>

          <section className="mb-7">
            <h2 className="mb-3 text-base font-normal text-brand-tamarillo">Programmes à venir</h2>
            <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {upcoming.length === 0 ? (
                <div className="min-w-full rounded-md border border-brand-tamarillo/40 p-4 text-sm text-brand-brown">Aucune séance à venir.</div>
              ) : (
                upcoming.slice(0, 4).map((assignment) => (
                  <article key={assignment.id} className="min-w-[250px] rounded-md border border-brand-tamarillo/70 p-3 text-brand-tamarillo">
                    <h3 className="truncate text-sm font-normal">{assignment.program_name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1"><ClockIcon />{assignment.session_minutes || 35} min</span>
                      <span className="inline-flex items-center gap-1"><LocationPin />{assignment.program_location || 'Domicile'}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-brand-tamarillo px-2 py-1 text-[0.65rem]">Course à pied</span>
                      <button type="button" className="inline-flex items-center gap-1 text-xs">
                        Voir la séance <ChevronRight />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
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

          <MetricChart title="Mon humeur de la semaine" data={checkins} type="mood" />
          <MetricChart title="Mon niveau de fatigue" data={checkins} type="energy" />
          <MetricChart title="Mon niveau de sommeil" data={checkins} type="sleep_quality" />

          <section>
            <h2 className="mb-3 text-base font-normal text-brand-tamarillo">Historique</h2>
            <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {history.length === 0 ? (
                <div className="min-w-full rounded-md border border-brand-tamarillo/40 p-4 text-sm text-brand-brown">Aucun historique pour le moment.</div>
              ) : (
                history.map((assignment) => (
                  <article key={assignment.id} className="min-w-[250px] rounded-md border border-brand-tamarillo/70 p-3 text-brand-tamarillo">
                    <h3 className="truncate text-sm font-normal">{assignment.program_name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1"><ClockIcon />{assignment.session_minutes || 35} min</span>
                      <span className="inline-flex items-center gap-1"><LocationPin />{assignment.program_location || 'Domicile'}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-brand-tamarillo px-2 py-1 text-[0.65rem]">Course à pied</span>
                      <button type="button" className="inline-flex items-center gap-1 text-xs">
                        Voir la séance <ChevronRight />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </CoachLayout>
  )
}

export default CoachClientDetailPage
