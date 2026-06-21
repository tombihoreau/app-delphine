import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import api from '../services/api'

const authInputClass =
  'h-[42px] w-full rounded-full border border-brand-tamarillo bg-transparent px-5 text-xs text-brand-brown outline-none placeholder:text-brand-tamarillo/70 focus:ring-2 focus:ring-brand-tamarillo/15'

const authButtonClass =
  'h-[43px] w-full rounded-full bg-brand-tamarillo px-5 text-sm font-bold text-brand-beige shadow-sm transition hover:opacity-95'

const SetPasswordPage = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      await api.post('/api/auth/set-password', { password })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la définition du mot de passe')
    }
  }

  return (
    <AuthShell
      title="Crée ton mot de passe"
      subtitle="C'est ta première connexion. Choisis un mot de passe pour sécuriser ton espace."
      compact
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={authInputClass}
          required
        />
        <input
          type="password"
          placeholder="Confirmation du mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={authInputClass}
          required
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <button type="submit" className={authButtonClass}>
          Accéder à mon espace
        </button>
      </form>
    </AuthShell>
  )
}

export default SetPasswordPage
