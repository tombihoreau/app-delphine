import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import MoodSmiley from '../components/MoodSmiley'
import SunIcon from '../components/SunIcon'
import WeeklyMetricChart from '../components/WeeklyMetricChart'

const weekLabels = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

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

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 10h16v10H4z" />
    <path d="M12 10v10M4 14h16" />
    <path d="M12 10H8.5a2.5 2.5 0 1 1 2.2-3.7L12 10Z" />
    <path d="M12 10h3.5a2.5 2.5 0 1 0-2.2-3.7L12 10Z" />
  </svg>
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

const SectionHeading = ({ title, weekLabel, onPrevious, onNext }) => (
  <div className="mb-3 flex items-center justify-between text-brand-tamarillo">
    <button type="button" onClick={onPrevious} aria-label="Semaine précédente">
      <Chevron direction="left" />
    </button>
    <div className="text-center">
      <h2 className="text-xl font-light text-brand-brown">{title}</h2>
      <p className="mt-1 text-xs italic text-brand-brown">{weekLabel}</p>
    </div>
    <button type="button" onClick={onNext} aria-label="Semaine suivante">
      <Chevron direction="right" />
    </button>
  </div>
)

const ClientProgressPage = () => {
  const navigate = useNavigate()
  const [progressByWeek, setProgressByWeek] = useState({})
  const [error, setError] = useState('')
  const [summaryWeekDate, setSummaryWeekDate] = useState(() => new Date())
  const [moodWeekDate, setMoodWeekDate] = useState(() => new Date())
  const [energyWeekDate, setEnergyWeekDate] = useState(() => new Date())
  const [sleepWeekDate, setSleepWeekDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()))
  const [selectedDailyState, setSelectedDailyState] = useState(undefined)

  const summaryWeekKey = formatDateKey(summaryWeekDate)
  const moodWeekKey = formatDateKey(moodWeekDate)
  const energyWeekKey = formatDateKey(energyWeekDate)
  const sleepWeekKey = formatDateKey(sleepWeekDate)

  const requestedWeekKeys = useMemo(() => (
    Array.from(new Set([summaryWeekKey, moodWeekKey, energyWeekKey, sleepWeekKey]))
  ), [summaryWeekKey, moodWeekKey, energyWeekKey, sleepWeekKey])

  useEffect(() => {
    requestedWeekKeys.forEach((weekKey) => {
      if (!progressByWeek[weekKey]) {
        loadProgress(weekKey)
      }
    })
  }, [requestedWeekKeys, progressByWeek])

  const loadProgress = async (weekKey) => {
    try {
      const response = await api.get('/api/client/progress', {
        params: { week: weekKey }
      })
      setProgressByWeek((current) => ({ ...current, [weekKey]: response.data }))
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

  const summaryData = progressByWeek[summaryWeekKey]
  const moodData = progressByWeek[moodWeekKey]
  const energyData = progressByWeek[energyWeekKey]
  const sleepData = progressByWeek[sleepWeekKey]

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
  const todayKey = formatDateKey(new Date())

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
                const isToday = day.key === todayKey
                const disabled = !day.hasCheckin && !isToday
                const selected = day.key === selectedDate
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
                    <h3 className="text-base font-light">{featuredSession.program_name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-brand-tamarillo">
                      <ClockIcon />
                      <span>{featuredSession.session_minutes || 35} min</span>
                    </div>
                    <span className="mt-2 inline-flex rounded-full border border-brand-tamarillo bg-brand-beige px-3 py-1 text-xs text-brand-tamarillo">
                      {featuredSession.program_category}
                    </span>
                  </div>
                  {featuredSession.feedback_id ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#6bbd7d] bg-[#e6f5e7] px-3 py-1 text-xs text-[#3d8a4c]">
                      <CheckIcon />
                      Réalisé
                    </span>
                  ) : null}
                </div>
              </article>
            ) : null}
          </section>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-6">
            <div className="lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-[520px]">
              <WeeklyMetricChart
                title="Mon humeur de la semaine"
                data={moodData?.checkins || []}
                type="mood"
                weekLabel={moodWeekLabel}
                onPreviousWeek={() => changeWeek(setMoodWeekDate, -1)}
                onNextWeek={() => changeWeek(setMoodWeekDate, 1)}
              />
            </div>
            <WeeklyMetricChart
              title="Mon niveau de fatigue"
              data={energyData?.checkins || []}
              type="energy"
              weekLabel={energyWeekLabel}
              onPreviousWeek={() => changeWeek(setEnergyWeekDate, -1)}
              onNextWeek={() => changeWeek(setEnergyWeekDate, 1)}
            />
            <WeeklyMetricChart
              title="Mon niveau de sommeil"
              data={sleepData?.checkins || []}
              type="sleep_quality"
              weekLabel={sleepWeekLabel}
              onPreviousWeek={() => changeWeek(setSleepWeekDate, -1)}
              onNextWeek={() => changeWeek(setSleepWeekDate, 1)}
            />
          </div>

          <section>
            <h2 className="mb-4 text-xl font-light text-brand-tamarillo">Mes informations</h2>
            <article className="rounded-md bg-brand-peach/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm leading-5 text-brand-brown">
                  <p>{user?.name || ''} {user?.age ? `${user.age} ans` : ''}</p>
                  <p className="text-[#902316]">{user?.email || ''}{user?.phone ? ` • ${user.phone}` : ''}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[#902316]">
                    <GiftIcon />
                    {user?.offer_type || 'Type d’offre'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/profile/edit')}
                  className="text-brand-tamarillo"
                  aria-label="Modifier mes informations"
                >
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
