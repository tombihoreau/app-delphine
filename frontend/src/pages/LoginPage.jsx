import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import api from '../services/api'
import useAuthStore from '../store/useAuthStore'

const authInputClass =
  'h-[42px] w-full rounded-full border border-brand-tamarillo bg-transparent px-5 text-xs italic text-brand-brown outline-none placeholder:text-brand-tamarillo/70 focus:ring-2 focus:ring-brand-tamarillo/15'

const authButtonClass =
  'h-[43px] w-full rounded-full bg-brand-tamarillo px-5 text-sm font-bold text-brand-beige shadow-sm transition hover:opacity-95'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState('email')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.post('/api/auth/check-email', { email })
      if (response.data.password_set) {
        setStep('password')
      } else {
        const loginResponse = await api.post('/api/auth/login', { email })
        login(loginResponse.data.user, loginResponse.data.token)
        navigate('/set-password')
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la vérification de l'email")
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.post('/api/auth/login', { email, password })
      login(response.data.user, response.data.token)
      navigate(response.data.user.role === 'admin' ? '/admin/programs' : '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    }
  }

  const isPasswordStep = step === 'password'
  const title = isPasswordStep ? 'Saisie ton mot de passe' : 'Bienvenue sur ton espace'
  const subtitle = isPasswordStep
    ? 'Entre ton mot de passe pour retrouver ton suivi.'
    : "Entre ton adresse e-mail pour accéder à l'application"

  return (
    <AuthShell title={title} subtitle={subtitle}>
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            required
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button type="submit" className={authButtonClass}>
            Valider mon adresse mail
          </button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            required
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button type="submit" className={authButtonClass}>
            Accéder à mon espace
          </button>
          <button
            type="button"
            className="text-xs font-medium text-brand-tamarillo underline underline-offset-2"
          >
            Mot de passe oublié ?
          </button>
        </form>
      )}
    </AuthShell>
  )
}

export default LoginPage
