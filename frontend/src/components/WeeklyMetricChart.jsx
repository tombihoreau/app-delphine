import MoodSmiley from './MoodSmiley'

const chartLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sa', 'Di']

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

export const getWeekStart = (date = new Date()) => {
  const current = new Date(date)
  current.setHours(12, 0, 0, 0)
  const day = current.getDay()
  const delta = day === 0 ? -6 : 1 - day
  current.setDate(current.getDate() + delta)
  return current
}

export const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatShortDate = (dateKey) => {
  const [year, month, day] = dateKey.split('-')
  return `${day}/${month}/${year}`
}

export const buildWeekRange = (weekStart) => {
  const start = formatDateKey(weekStart)
  const end = formatDateKey(addDays(weekStart, 6))
  return {
    start,
    end,
    label: `${formatShortDate(start)} au ${formatShortDate(end)}`
  }
}

export const filterWeekData = (data, weekStart) => {
  const { start, end } = buildWeekRange(weekStart)
  return data.filter((item) => item.checkin_date >= start && item.checkin_date <= end)
}

const getWeekdayIndex = (dateKey) => {
  const day = new Date(`${dateKey}T12:00:00`).getDay()
  return day === 0 ? 6 : day - 1
}

const chartWidth = 380
const paddingX = 24
const moodBandCenters = {
  5: 45,
  4: 95,
  3: 145,
  2: 195,
  1: 245
}
const moodGridLines = [70, 120, 170, 220]

const chartX = (dayIndex) => paddingX + dayIndex * ((chartWidth - paddingX * 2) / 6)

const buildMoodPoints = (data) =>
  data
    .filter((item) => typeof item.mood === 'number' && item.checkin_date)
    .map((item) => {
      const dayIndex = getWeekdayIndex(item.checkin_date)
      return {
        value: item.mood,
        dayIndex,
        x: chartX(dayIndex),
        y: moodBandCenters[item.mood] || moodBandCenters[3]
      }
    })
    .sort((a, b) => a.dayIndex - b.dayIndex)

const buildSmoothPath = (points) => {
  if (!points.length) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`

    const previous = points[index - 1]
    const midX = (previous.x + point.x) / 2
    return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`
  }, '')
}

const lineColor = (type) => {
  if (type === 'mood') return '#9AD15B'
  if (type === 'energy') return '#c5c2bc'
  if (type === 'sleep_quality') return '#bdb9b3'
  return '#c5c2bc'
}

const scoreColor = (value) => ({
  5: '#ffd84f',
  4: '#83d7a4',
  3: '#e7dfed',
  2: '#b8bbff',
  1: '#f18a6d'
}[Number(value)] || '#d4d1cb')

const buildMetricPoints = (data, type) => {
  const topCenter = 36
  const bottomCenter = 176
  const stepY = (bottomCenter - topCenter) / 4

  return data
    .filter((item) => typeof item[type] === 'number' && item.checkin_date)
    .map((item) => {
      const dayIndex = getWeekdayIndex(item.checkin_date)
      return {
        value: item[type],
        dayIndex,
        x: chartX(dayIndex),
        y: bottomCenter - (item[type] - 1) * stepY
      }
    })
    .sort((a, b) => a.dayIndex - b.dayIndex)
}

const Legend = ({ type, textClass }) => (
  <div className={`absolute bottom-0 left-0 right-0 flex flex-wrap gap-x-3 gap-y-1 ${textClass} text-brand-tamarillo`}>
    {type === 'energy' ? (
      <>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#ffd84f]" />Energique</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#83d7a4]" />En forme</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#e7dfed]" />Moyen</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#b8bbff]" />Fatigué</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#f18a6d]" />Très fatigué</span>
      </>
    ) : type === 'sleep_quality' ? (
      <>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#ffd84f]" />Excellent</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#83d7a4]" />Bon</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#e7dfed]" />Moyen</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#b8bbff]" />Mauvais</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#f18a6d]" />Très mauvais</span>
      </>
    ) : (
      <>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#ffd84f]" />Très bien</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#83d7a4]" />Bien</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#eee7ec]" />Neutre</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#b8bbff]" />Fatigué</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#f18a6d]" />En colère</span>
      </>
    )}
  </div>
)

const WeeklyMetricChart = ({ title, data, type, weekLabel, onPreviousWeek, onNextWeek }) => {
  const dayMarkerTop = type === 'mood' ? 285 : 195
  const legendTextClass = type === 'mood' ? 'text-xs' : 'text-[0.72rem]'

  if (type === 'mood') {
    const points = buildMoodPoints(data)

    return (
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between text-brand-tamarillo">
          <button type="button" onClick={onPreviousWeek} aria-label="Semaine précédente"><ChevronLeft /></button>
          <div className="text-center">
            <h2 className="text-base font-light">{title}</h2>
            <p className="mt-1 text-[0.68rem] text-brand-tamarillo/80">{weekLabel}</p>
          </div>
          <button type="button" onClick={onNextWeek} aria-label="Semaine suivante"><ChevronRight /></button>
        </div>
        <div className="relative h-[335px]">
          {moodGridLines.map((lineTop) => (
            <div key={lineTop} className="absolute left-0 right-0 border-t border-brand-brown/10" style={{ top: lineTop }} />
          ))}
          <svg viewBox={`0 0 ${chartWidth} 285`} className="absolute inset-x-0 top-0 mx-auto h-[285px] w-full max-w-[380px]">
            <path d={buildSmoothPath(points)} fill="none" stroke="rgba(57,6,0,0.14)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="absolute inset-x-0 top-0 mx-auto h-[285px] w-full max-w-[380px]">
            {chartLabels.map((label, index) => (
              <div
                key={`${title}-marker-${label}`}
                className="absolute h-3 border-l border-brand-brown/10"
                style={{ left: chartX(index), top: dayMarkerTop - 10 }}
              />
            ))}
            {points.map((point) => (
              <MoodSmiley
                key={`${title}-${point.dayIndex}-${point.value}`}
                value={point.value}
                alt=""
                variant="chart"
                className="absolute h-10 w-10"
                style={{ top: point.y - 20, left: point.x - 20 }}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-9 mx-auto grid w-full max-w-[380px] grid-cols-7 text-center text-sm text-brand-brown">
            {chartLabels.map((label) => <span key={`${title}-${label}`}>{label}</span>)}
          </div>
          <Legend type={type} textClass={legendTextClass} />
        </div>
      </section>
    )
  }

  const points = buildMetricPoints(data, type)

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between text-brand-tamarillo">
        <button type="button" onClick={onPreviousWeek} aria-label="Semaine précédente"><ChevronLeft /></button>
        <div className="text-center">
          <h2 className="text-base font-light">{title}</h2>
          <p className="mt-1 text-[0.68rem] text-brand-tamarillo/80">{weekLabel}</p>
        </div>
        <button type="button" onClick={onNextWeek} aria-label="Semaine suivante"><ChevronRight /></button>
      </div>
      <div className="relative h-[255px]">
        {[36, 71, 106, 141, 176].map((lineTop, index) => (
          <div key={`${title}-${lineTop}`} className="absolute left-0 right-0 border-t border-brand-brown/10" style={{ top: lineTop }}>
            <span className="sr-only">{5 - index}</span>
          </div>
        ))}
        <svg viewBox={`0 0 ${chartWidth} 210`} className="absolute inset-x-0 top-0 mx-auto h-[210px] w-full max-w-[380px]">
          <path d={buildSmoothPath(points)} fill="none" stroke={lineColor(type)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <circle key={`${title}-${point.dayIndex}`} cx={point.x} cy={point.y} r="4.5" fill={scoreColor(point.value)} />
          ))}
        </svg>
        <div className="absolute inset-x-0 bottom-9 mx-auto grid w-full max-w-[380px] grid-cols-7 text-center text-sm text-brand-brown">
          {chartLabels.map((label) => <span key={`${title}-${label}`}>{label}</span>)}
        </div>
        <Legend type={type} textClass={legendTextClass} />
      </div>
    </section>
  )
}

export default WeeklyMetricChart
