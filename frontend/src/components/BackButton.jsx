import { useNavigate } from 'react-router-dom'

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-2 text-lg font-medium text-brand-tamarillo ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="m15 18-6-6 6-6" />
      </svg>
      Retour
    </button>
  )
}

export default BackButton
