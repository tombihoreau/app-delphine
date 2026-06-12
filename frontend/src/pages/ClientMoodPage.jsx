import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MoodSmiley from '../components/MoodSmiley'
import SunIcon from '../components/SunIcon'
import BackButton from '../components/BackButton'

const moods = [
  { value: 5, label: 'Très bien' },
  { value: 4, label: 'Bien' },
  { value: 3, label: 'Neutre' },
  { value: 2, label: 'Fatigué' },
  { value: 1, label: 'Colère' }
]

const ClientMoodPage = () => {
  const navigate = useNavigate()
  const [selectedMood, setSelectedMood] = useState(5)
  const currentMood = moods.find((mood) => mood.value === selectedMood) || moods[0]

  return (
    <div className="client-screen">
      <div className="client-frame flex min-h-[calc(100vh-4rem)] flex-col">
        <BackButton className="mb-6" />
        <main className="flex flex-1 flex-col items-center justify-center pb-20 text-center">
          <SunIcon className="mb-6 h-8 w-8" />
          <h1 className="font-display text-3xl font-normal leading-tight text-brand-tamarillo">
            Comment te sens-tu aujourd’hui ?
          </h1>
          <p className="mt-3 text-sm italic text-brand-brown">Sélectionne ton ressenti de la journée</p>

          <MoodSmiley value={selectedMood} alt={currentMood.label} className="mt-11 h-36 w-36" />
          <p className="mt-5 text-xl font-medium text-brand-brown">{currentMood.label}</p>

          <div className="mt-12 grid w-full grid-cols-5 gap-2">
            {moods.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={`rounded-md px-2 py-3 text-brand-brown ${selectedMood === mood.value ? 'bg-brand-peach/45' : ''}`}
              >
                <MoodSmiley value={mood.value} alt={mood.label} className="mx-auto h-10 w-10" />
                <span className="mt-2 block text-xs">{mood.label}</span>
              </button>
            ))}
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          <div className="mx-auto max-w-md">
            <button
              type="button"
              onClick={() => navigate('/mood/details', { state: { mood: selectedMood } })}
              className="w-full rounded-full bg-brand-tamarillo px-6 py-4 text-base font-bold text-brand-beige"
            >
              Ajouter mon mood
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientMoodPage
