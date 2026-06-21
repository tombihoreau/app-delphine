import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/useAuthStore'

const BackIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const FieldLabel = ({ children }) => (
  <label className="mb-2 block text-xs text-brand-brown">
    {children}
  </label>
)

const fieldClass = 'h-[43px] w-full rounded-md border border-brand-brown/35 bg-transparent px-4 text-sm text-brand-brown placeholder:text-brand-brown/35 outline-none focus:border-brand-tamarillo'

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' ')
  }
}

const ClientProfileEditPage = () => {
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.user)
  const [form, setForm] = useState({
    email: '',
    last_name: '',
    first_name: '',
    phone: '',
    birth_date: ''
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/api/client/progress')
        const user = response.data.user || {}
        const fallbackName = splitName(user.name || authUser?.name || '')

        setForm({
          email: user.email || authUser?.email || '',
          last_name: user.last_name || fallbackName.last_name,
          first_name: user.first_name || fallbackName.first_name,
          phone: user.phone || '',
          birth_date: user.birth_date || ''
        })
      } catch (err) {
        setError('Impossible de charger tes informations')
      }
    }

    loadProfile()
  }, [authUser])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await api.put('/api/client/profile', form)
      const updatedUser = response.data.user

      if (updatedUser) {
        useAuthStore.setState((state) => ({
          user: { ...state.user, ...updatedUser }
        }))
      }

      navigate('/progres')
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de modifier tes informations')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="client-screen">
      <div className="client-frame flex min-h-[calc(100vh-4rem)] flex-col">
        <form id="client-profile-form" onSubmit={submit} className="flex flex-1 flex-col pb-32">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
          >
            <BackIcon />
            Retour
          </button>

          <h1 className="mb-7 font-display text-3xl font-normal leading-tight text-brand-tamarillo">
            Modifier mes informations
          </h1>

          {error && (
            <p className="mb-5 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <FieldLabel>Mail</FieldLabel>
              <input
                type="email"
                placeholder="nom@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={fieldClass}
                required
              />
            </div>

            <div>
              <FieldLabel>Nom</FieldLabel>
              <input
                type="text"
                placeholder="Nom"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className={fieldClass}
                required
              />
            </div>

            <div>
              <FieldLabel>Prénom</FieldLabel>
              <input
                type="text"
                placeholder="Prénom"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className={fieldClass}
                required
              />
            </div>

            <div>
              <FieldLabel>Téléphone</FieldLabel>
              <input
                type="tel"
                placeholder="01 02 03 04 05"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div>
              <FieldLabel>Date de naissance</FieldLabel>
              <input
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
          </div>
        </form>

        <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          <div className="mx-auto max-w-md">
            <button
              type="submit"
              form="client-profile-form"
              disabled={saving}
              className="w-full rounded-full bg-brand-tamarillo px-6 py-4 text-lg font-bold text-brand-beige disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : 'Valider'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientProfileEditPage
