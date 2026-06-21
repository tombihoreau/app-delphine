import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CoachLayout from '../components/CoachLayout'
import api from '../services/api'

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m16.5 16.5 4 4" />
  </svg>
)

const PlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M8 3v4M16 3v4M4 10h16" />
  </svg>
)

const formatJoinDate = (createdAt) => {
  if (!createdAt) return ''

  const date = new Date(createdAt)
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${day}/${month}/${year}`
}

const getClientPhone = (client) => {
  return client.phone || client.phone_number || client.mobile || ''
}

const CoachClientsPage = () => {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  const filteredClients = useMemo(() => {
    if (!query.trim()) return clients

    const normalized = query.toLowerCase()

    return clients.filter((client) =>
      [
        client.name,
        client.email,
        getClientPhone(client)
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    )
  }, [clients, query])

  const loadClients = async () => {
    try {
      const response = await api.get('/api/admin/users')
      setClients(response.data || [])
    } catch (err) {
      setError('Erreur lors du chargement des clients')
    }
  }

  return (
    <CoachLayout headerLabel="Programmes" title="Tous les clients">
      {error && (
        <p className="mb-4 rounded-md border border-brand-tamarillo bg-brand-peach/30 px-4 py-3 text-sm text-brand-tamarillo">
          {error}
        </p>
      )}

      <div className="mb-7 flex items-center gap-4">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-[54px] w-full rounded-full border border-brand-tamarillo bg-transparent pl-6 pr-14 text-base text-brand-tamarillo placeholder:text-brand-tamarillo/80 outline-none focus:ring-2 focus:ring-brand-tamarillo/20"
          />

          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-tamarillo">
            <SearchIcon />
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/clients/new')}
          className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-brand-tamarillo text-brand-beige shadow-float"
          aria-label="Ajouter un client"
        >
          <PlusIcon />
        </button>
      </div>

      <div className="space-y-5">
        {filteredClients.map((client) => {
          const phone = getClientPhone(client)
          const joinDate = formatJoinDate(client.created_at)

          return (
            <article
              key={client.id}
              onClick={() => navigate(`/admin/clients/${client.id}`)}
              className="cursor-pointer rounded-lg bg-brand-peach/60 px-4 py-4 text-brand-tamarillo transition hover:bg-brand-peach"
            >
              <h2 className="text-lg font-normal text-brand-brown">
                {client.name}
                {client.age ? ` ${client.age} ans` : ''}
              </h2>

              <p className="mt-1 text-sm text-brand-tamarillo">
                {client.email}
                {phone ? ` • ${phone}` : ''}
              </p>

              <div className="mt-2 space-y-1 text-sm text-brand-tamarillo">
                {joinDate ? (
                  <p className="flex items-center gap-1.5">
                    <CalendarIcon />
                    Depuis {joinDate}
                  </p>
                ) : null}
              </div>
            </article>
          )
        })}

        {filteredClients.length === 0 && (
          <p className="py-8 text-center text-sm text-brand-brown">
            Aucun client trouvé.
          </p>
        )}
      </div>
    </CoachLayout>
  )
}

export default CoachClientsPage
