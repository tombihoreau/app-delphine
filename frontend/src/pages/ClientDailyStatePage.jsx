import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import SunIcon from '../components/SunIcon'
import BackButton from '../components/BackButton'

const SliderQuestion = ({ title, subtitle, labels, value, onChange }) => (
  <section className="mb-14">
    <h2 className="text-xl font-medium text-brand-brown">{title}</h2>
    <p className="mt-1 text-sm italic text-brand-brown/80">{subtitle}</p>
    <div className="mt-10">
      <div className="relative h-5">
        <div className="absolute left-2 right-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-peach" />
        <div className="relative flex justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              className={`h-5 w-5 rounded-full bg-brand-peach ${
                step === value ? 'border-4 border-brand-tamarillo' : 'border-0'
              }`}
              aria-label={`${title} ${step}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2 text-center text-[0.68rem] text-brand-brown">
        {labels.map((label) => <span key={label}>{label}</span>)}
      </div>
    </div>
  </section>
)

const ClientDailyStatePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [energy, setEnergy] = useState(3)
  const [stress, setStress] = useState(3)
  const [sleepQuality, setSleepQuality] = useState(3)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const mood = location.state?.mood || 5

  const submit = async () => {
    setSaving(true)
    setError('')
    try {
      await api.post('/api/client/checkins', {
        mood,
        energy: 6 - energy,
        stress,
        sleep_quality: 6 - sleepQuality
      })
      navigate('/progres')
    } catch (err) {
      setError("Impossible d'enregistrer tes réponses")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="client-screen">
      <div className="client-frame flex min-h-[calc(100vh-4rem)] flex-col">
        <main className="flex-1 pb-40">
          {error && <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">{error}</p>}

          <BackButton className="mb-7" />

          <h1 className="mb-11 flex items-center gap-2 font-display text-3xl font-normal text-brand-tamarillo">
            <SunIcon className="h-8 w-8" />
            État du jour
          </h1>

          <SliderQuestion
            title="Quel est ton niveau de fatigue ?"
            subtitle="Sélectionne ton niveau de fatigue actuel"
            labels={['Energique', 'En forme', 'Moyen', 'Fatiguée', 'Très fatiguée']}
            value={energy}
            onChange={setEnergy}
          />
          <SliderQuestion
            title="Quel est ton niveau de stress ?"
            subtitle="Sélectionne ton niveau de stress actuel"
            labels={['Sereine', 'Un peu stressée', 'Stressée', 'Très stressée', 'Débordée']}
            value={stress}
            onChange={setStress}
          />
          <SliderQuestion
            title="Comment as-tu dormi cette nuit ?"
            subtitle="Sélectionne la qualité de ton sommeil actuel"
            labels={['Excellent', 'Bon', 'Moyen', 'Mauvais', 'Très mauvais']}
            value={sleepQuality}
            onChange={setSleepQuality}
          />
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          <div className="mx-auto max-w-md">
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="w-full rounded-full bg-brand-tamarillo px-6 py-4 text-base font-bold text-brand-beige disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : 'Confirmer mes réponses'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDailyStatePage
