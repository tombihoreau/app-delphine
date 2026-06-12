import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import MoodSmiley from '../components/MoodSmiley'
import SunIcon from '../components/SunIcon'

const weekLabels = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const chartLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sa', 'Di']

const Chevron = ({ direction = 'left' }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m5 12 4 4L19 6" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
  </svg>
)

const ProgramIcon = () => (
  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-brand-beige">
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-brown" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 17c1.1-2.2 2.8-4 5-5.5M8.5 8c1.4.1 2.4 1 3 2.3M5 20h14M9 15l-3 3M11 9l2-2m-6 5 1-4 4-1 2.5 2.5-1 4-4 1Z" />
    </svg>
  </div>
)

const moodLabel = (value) => {
  if (value >= 5) return 'Très bien'
  if (value >= 4) return 'Bien'
  if (value === 3) return 'Neutre'
  if (value === 2) return 'Fatigué'
  return 'En colère'
}

const chipStyle = (tone) => {
  if (tone === 'green') return 'border-[#6bbd7d] bg-[#e6f5e7] text-[#3d8a4c]'
  if (tone === 'peach') return 'border-[#d98369] bg-brand-peach/60 text-brand-tamarillo'
  return 'border-[#b9adb4] bg-[#efe9ee] text-[#6c6370]'
}

const formatDateKey = (date) => {
  const current = new Date(date)
  const year = current.getFullYear()
  const month = String(current.getMonth() + 1).padStart(2, '0')
  const day = String(current.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatPrettyDate = (value) => value.split('-').reverse().join('/')

const formatShortDate = (value) => {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year.slice(-2)}`
}

const formatWeekLabel = (weekRange) => {
  if (!weekRange?.start || !weekRange?.end) return ''
  return `${formatShortDate(weekRange.start)} au ${formatShortDate(weekRange.end)}`
}

const buildWeekDays = (weekRange, assignments, checkins = []) => {
  if (!weekRange?.start) return []
  const start = new Date(`${weekRange.start}T12:00:00`)
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start)
    current.setDate(start.getDate() + index)
    const key = formatDateKey(current)
    return {
      key,
      label: weekLabels[index],
      day: current.getDate(),
      hasAssignment: assignments.some((assignment) => assignment.scheduled_date === key),
      hasCheckin: checkins.some((checkin) => checkin.checkin_date === key)
    }
  })
}

const buildPath = (values) => {
  if (!values.length) return ''
  const width = 300
  const height = 150
  const stepX = values.length === 1 ? 0 : width / (values.length - 1)
  const points = values.map((value, index) => {
    const x = index * stepX
    const y = height - ((value - 1) / 4) * (height - 14) - 7
    return [x, y]
  })
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
}

const getWeekdayIndex = (dateKey) => {
  const day = new Date(`${dateKey}T12:00:00`).getDay()
  return day === 0 ? 6 : day - 1
}

const buildMoodPoints = (data) => {
  const width = 340
  const paddingX = 24
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

const SectionHeading = ({ title, weekLabel, onPrevious, onNext }) => (
  <div className="mb-3 flex items-center justify-between text-brand-tamarillo">
    <button type="button" onClick={onPrevious} aria-label="Semaine précédente">
      <Chevron direction="left" />
    </button>
    <div className="text-center">
      <h2 className="text-xl font-medium text-brand-brown">{title}</h2>
      <p className="mt-1 text-xs italic text-brand-brown">{weekLabel}</p>
    </div>
    <button type="button" onClick={onNext} aria-label="Semaine suivante">
      <Chevron direction="right" />
    </button>
  </div>
)

const MoodChart = ({ data, weekLabel, onPrevious, onNext }) => {
  const points = buildMoodPoints(data)

  return (
    <section className="mb-7">
      <SectionHeading title="Mon humeur de la semaine" weekLabel={weekLabel} onPrevious={onPrevious} onNext={onNext} />
      <div className="relative h-[315px] overflow-hidden">
        {moodGridLines.map((lineTop) => (
          <div key={lineTop} className="absolute left-0 right-0 border-t border-brand-brown/10" style={{ top: 32 + lineTop }} />
        ))}
        <svg viewBox="0 0 340 290" className="absolute inset-x-0 top-8 mx-auto h-[300px] w-full max-w-[340px]">
          <path d={buildSmoothPath(points)} fill="none" stroke="rgba(57, 6, 0, 0.18)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="absolute inset-x-0 top-8 mx-auto h-[290px] w-full max-w-[340px]">
          {points.map((point) => {
            const top = point.y - 20
            return (
              <MoodSmiley
                key={`${point.dayIndex}-${point.value}`}
                value={point.value}
                alt=""
                variant="chart"
                className="absolute h-10 w-10"
                style={{ top, left: point.x - 20 }}
              />
            )
          })}
        </div>
        <div className="absolute inset-x-0 bottom-8 mx-auto grid w-full max-w-[340px] grid-cols-7 text-center text-xs text-brand-brown">
          {chartLabels.map((label) => <span key={label}>{label}</span>)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] text-brand-brown/80">
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#ffd84f]" />Très bien</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#83d7a4]" />Bien</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#eee7ec]" />Neutre</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#b8bbff]" />Fatigué</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#f18a6d]" />En colère</span>
        </div>
      </div>
    </section>
  )
}

const LineChart = ({ title, data, type, weekLabel, onPrevious, onNext }) => {
  const values = data.map((item) => item[type]).filter((value) => typeof value === 'number')

  return (
    <section className="mb-7">
      <SectionHeading title={title} weekLabel={weekLabel} onPrevious={onPrevious} onNext={onNext} />
      <div className="relative h-[225px] pl-7">
        {[1, 2, 3, 4, 5].map((value, index) => (
          <div key={value} className="absolute left-7 right-0 border-t border-brand-brown/10" style={{ top: `${14 + index * 18}%` }}>
            <span className="absolute left-[-22px] -translate-y-1/2 text-xs text-brand-brown">{6 - value}</span>
          </div>
        ))}
        <svg viewBox="0 0 300 160" className="absolute inset-x-0 top-3 mx-auto h-[170px] w-full max-w-[300px]">
          <path d={buildPath(values)} fill="none" stroke="rgba(57, 6, 0, 0.16)" strokeWidth="1.5" />
          {values.map((value, index) => {
            const x = values.length === 1 ? 0 : (300 / (values.length - 1)) * index
            const y = 150 - ((value - 1) / 4) * 136 - 7
            const color = type === 'energy' ? '#ffc928' : value >= 4 ? '#d9dee0' : value === 3 ? '#e7dfed' : '#b8bbff'
            return <circle key={`${type}-${index}`} cx={x} cy={y} r="5" fill={color} />
          })}
        </svg>
        <div className="absolute inset-x-0 bottom-0 ml-7 grid max-w-[300px] grid-cols-7 text-center text-xs text-brand-brown">
          {chartLabels.map((label) => <span key={`${title}-${label}`}>{label}</span>)}
        </div>
      </div>
    </section>
  )
}

const ClientProgressPage = () => {
  const [summaryData, setSummaryData] = useState(null)
  const [moodData, setMoodData] = useState(null)
  const [energyData, setEnergyData] = useState(null)
  const [sleepData, setSleepData] = useState(null)
  const [error, setError] = useState('')
  const [summaryWeekDate, setSummaryWeekDate] = useState(() => new Date())
  const [moodWeekDate, setMoodWeekDate] = useState(() => new Date())
  const [energyWeekDate, setEnergyWeekDate] = useState(() => new Date())
  const [sleepWeekDate, setSleepWeekDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()))
  const [selectedDailyState, setSelectedDailyState] = useState(undefined)

  useEffect(() => {
    loadProgress(summaryWeekDate, setSummaryData)
  }, [summaryWeekDate])

  useEffect(() => {
    loadProgress(moodWeekDate, setMoodData)
  }, [moodWeekDate])

  useEffect(() => {
    loadProgress(energyWeekDate, setEnergyData)
  }, [energyWeekDate])

  useEffect(() => {
    loadProgress(sleepWeekDate, setSleepData)
  }, [sleepWeekDate])

  const loadProgress = async (date, setSectionData) => {
    try {
      const response = await api.get('/api/client/progress', {
        params: { week: formatDateKey(date) }
      })
      setSectionData(response.data)
    } catch (err) {
      setError('Erreur lors du chargement de votre espace')
    }
  }

  const changeWeek = (setWeekDate, direction) => {
    setWeekDate((current) => {
      const next = new Date(current)
      next.setDate(current.getDate() + direction * 7)
      return next
    })
  }

  const changeSummaryWeek = (direction) => {
    setSummaryWeekDate((current) => {
      const next = new Date(current)
      next.setDate(current.getDate() + direction * 7)
      return next
    })
  }

  const weekDays = useMemo(
    () => buildWeekDays(
      summaryData?.weekRange,
      summaryData?.weekAssignments || [],
      summaryData?.checkins || []
    ),
    [summaryData]
  )

  const summaryWeekLabel = formatWeekLabel(summaryData?.weekRange)
  const moodWeekLabel = formatWeekLabel(moodData?.weekRange)
  const energyWeekLabel = formatWeekLabel(energyData?.weekRange)
  const sleepWeekLabel = formatWeekLabel(sleepData?.weekRange)

  useEffect(() => {
    if (!summaryData || selectedDailyState !== undefined) return

    const checkins = summaryData?.checkins || []
    const assignments = summaryData?.weekAssignments || []
    setSelectedDailyState({
      checkin: checkins.find((checkin) => checkin.checkin_date === selectedDate) || null,
      session: assignments.find((assignment) => assignment.scheduled_date === selectedDate) || null
    })
  }, [summaryData, selectedDailyState, selectedDate])

  const selectSummaryDay = (dayKey) => {
    const checkins = summaryData?.checkins || []
    const assignments = summaryData?.weekAssignments || []
    setSelectedDate(dayKey)
    setSelectedDailyState({
      checkin: checkins.find((checkin) => checkin.checkin_date === dayKey) || null,
      session: assignments.find((assignment) => assignment.scheduled_date === dayKey) || null
    })
  }

  const selectedCheckin = selectedDailyState?.checkin || null
  const selectedMood = selectedCheckin?.mood || 5
  const fatigueTone = selectedCheckin ? (selectedCheckin.energy >= 4 ? 'green' : 'peach') : 'neutral'
  const stressTone = selectedCheckin ? (selectedCheckin.stress >= 4 ? 'peach' : 'green') : 'neutral'
  const sleepTone = selectedCheckin ? (selectedCheckin.sleep_quality >= 4 ? 'green' : 'neutral') : 'neutral'
  const featuredSession = selectedDailyState?.session || null
  const user = summaryData?.user

  return (
    <div className="client-screen">
      <div className="client-frame">
        <section className="pb-8">
          {error && <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">{error}</p>}

          <h1 className="mb-7 flex items-center gap-2 client-title">
            <SunIcon className="h-8 w-8" />
            Mon espace
          </h1>

          <section className="mb-7 rounded-md border border-brand-tamarillo bg-brand-beige px-3 py-4">
            <SectionHeading
              title="Mon bilan de la semaine"
              weekLabel={summaryWeekLabel}
              onPrevious={() => changeSummaryWeek(-1)}
              onNext={() => changeSummaryWeek(1)}
            />

            <div className="mb-5 grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const disabled = !day.hasCheckin
                const selected = day.key === selectedDate && !disabled
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => selectSummaryDay(day.key)}
                    disabled={disabled}
                    className={`flex flex-col items-center gap-2 ${
                      disabled ? 'cursor-not-allowed text-brand-brown/35' : 'text-brand-tamarillo'
                    }`}
                  >
                    <span className="text-xs">{day.label}</span>
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border font-display text-xl font-normal ${
                        selected
                          ? 'border-brand-tamarillo bg-brand-tamarillo text-brand-beige'
                          : disabled
                            ? 'border-brand-brown/20 bg-[#eee9e6] text-brand-brown/35'
                            : 'border-brand-tamarillo bg-brand-beige text-brand-tamarillo'
                      }`}
                    >
                      {day.day}
                      {day.hasCheckin ? (
                        <span className={`absolute -bottom-3 h-1.5 w-1.5 rounded-full ${selected ? 'bg-brand-tamarillo' : 'bg-brand-brown/50'}`} />
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mb-5 flex flex-col items-center">
              {selectedCheckin ? (
                <>
                  <MoodSmiley value={selectedMood} alt={moodLabel(selectedMood)} className="h-24 w-24" />
                  <p className="mt-3 text-sm text-brand-tamarillo">{moodLabel(selectedMood)}</p>
                </>
              ) : (
                <p className="rounded-md bg-brand-peach/35 px-4 py-3 text-center text-sm text-brand-brown">
                  Aucune donnée pour ce jour.
                </p>
              )}
            </div>

            <div className="mb-4 divide-y divide-brand-brown/10 text-sm">
              <div className="flex items-center justify-between py-3">
                <span>Niveau de fatigue</span>
                <span className={`rounded-full border px-3 py-1 text-xs ${chipStyle(fatigueTone)}`}>
                  {selectedCheckin ? (selectedCheckin.energy >= 4 ? 'En forme' : 'Un peu') : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span>Niveau de stress</span>
                <span className={`rounded-full border px-3 py-1 text-xs ${chipStyle(stressTone)}`}>
                  {selectedCheckin ? (selectedCheckin.stress >= 4 ? 'Un peu' : 'Calme') : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span>Sommeil</span>
                <span className={`rounded-full border px-3 py-1 text-xs ${chipStyle(sleepTone)}`}>
                  {selectedCheckin ? (selectedCheckin.sleep_quality >= 4 ? 'Très bon' : 'Correct') : '-'}
                </span>
              </div>
            </div>

            {featuredSession ? (
              <article className="rounded-md bg-brand-peach/35 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium">{featuredSession.program_name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-brand-tamarillo">
                      <ClockIcon />
                      <span>{featuredSession.session_minutes || 35} min</span>
                    </div>
                    <span className="mt-2 inline-flex rounded-full border border-brand-tamarillo bg-brand-beige px-3 py-1 text-xs text-brand-tamarillo">
                      {featuredSession.program_location || 'Course à pied'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#6bbd7d] bg-[#e6f5e7] px-3 py-1 text-xs text-[#3d8a4c]">
                    <CheckIcon />
                    Réalisé
                  </span>
                </div>
              </article>
            ) : null}
          </section>

          <MoodChart
            data={moodData?.checkins || []}
            weekLabel={moodWeekLabel}
            onPrevious={() => changeWeek(setMoodWeekDate, -1)}
            onNext={() => changeWeek(setMoodWeekDate, 1)}
          />
          <LineChart
            title="Mon niveau de fatigue"
            data={energyData?.checkins || []}
            type="energy"
            weekLabel={energyWeekLabel}
            onPrevious={() => changeWeek(setEnergyWeekDate, -1)}
            onNext={() => changeWeek(setEnergyWeekDate, 1)}
          />
          <LineChart
            title="Mon niveau de sommeil"
            data={sleepData?.checkins || []}
            type="sleep_quality"
            weekLabel={sleepWeekLabel}
            onPrevious={() => changeWeek(setSleepWeekDate, -1)}
            onNext={() => changeWeek(setSleepWeekDate, 1)}
          />

          <section>
            <h2 className="mb-4 font-display text-xl font-normal text-brand-tamarillo">Mes informations</h2>
            <article className="rounded-md bg-brand-peach/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm leading-5 text-brand-brown">
                  <p>{user?.name || 'Adeline Line'} {user?.age ? `${user.age} ans` : ''}</p>
                  <p>{user?.email || 'adeline@line.com'} • {user?.phone || '01 02 03 04 05'}</p>
                  <p>{user?.offer_type || 'Type d’offre'}</p>
                </div>
                <button type="button" className="text-brand-tamarillo" aria-label="Modifier mes informations">
                  <EditIcon />
                </button>
              </div>
            </article>
          </section>
        </section>
      </div>
    </div>
  )
}

export default ClientProgressPage
