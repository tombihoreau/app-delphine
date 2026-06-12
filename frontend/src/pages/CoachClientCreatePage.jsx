import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import api from '../services/api'

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

const coachFieldClass = 'h-[43px] w-full rounded-md border border-brand-brown/35 bg-transparent px-4 text-sm text-brand-brown placeholder:text-brand-brown/35 outline-none focus:border-brand-tamarillo'

const CoachClientCreatePage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    last_name: '',
    first_name: '',
    birth_date: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await api.post('/api/admin/users', {
        ...form,
        name: `${form.first_name} ${form.last_name}`.trim()
      })
      navigate('/admin/clients')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du client')
    }
  }

  return (
    <CoachLayout headerLabel="Coach_ajout client" title="">
      {error && <p className="status-banner bg-[#fdeaea] text-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="flex min-h-[calc(100vh-8rem)] flex-col">
        <button
          type="button"
          onClick={() => navigate('/admin/clients')}
          className="mb-5 inline-flex items-center gap-1 text-sm text-brand-tamarillo"
        >
          <BackIcon />
          Retour
        </button>

        <h1 className="mb-7 font-display text-3xl font-normal text-brand-tamarillo">
          Ajouter un client
        </h1>

        <div className="space-y-4">
          <div>
            <FieldLabel>Mail</FieldLabel>
            <input
              type="email"
              placeholder="nom@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={coachFieldClass}
              required
            />
          </div>

          <div>
            <FieldLabel>Mot de passe</FieldLabel>
            <input
              type="password"
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={coachFieldClass}
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
              className={coachFieldClass}
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
              className={coachFieldClass}
              required
            />
          </div>

          <div>
            <FieldLabel>Date de naissance</FieldLabel>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className={coachFieldClass}
              required
            />
          </div>
        </div>

        <div className="mt-auto pt-12">
          <button type="submit" className="w-full rounded-full bg-brand-tamarillo px-5 py-4 text-base font-bold text-brand-beige shadow-float">
            Valider
          </button>
        </div>
      </form>
    </CoachLayout>
  )
}

export default CoachClientCreatePage
