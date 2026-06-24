import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CoachClientForm from '../components/CoachClientForm'
import api from '../services/api'

const emptyForm = {
  email: '',
  last_name: '',
  first_name: '',
  phone: '',
  birth_date: '',
  offer_type: ''
}

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) {
    return { first_name: parts[0] || '', last_name: '' }
  }

  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' ')
  }
}

const CoachClientEditPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(emptyForm)
  const [clientName, setClientName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadClient()
  }, [id])

  const loadClient = async () => {
    setError('')

    try {
      const response = await api.get(`/api/admin/users/${id}`)
      const user = response.data.user
      const fallbackNames = splitName(user.name)

      setClientName(user.name || '')
      setForm({
        email: user.email || '',
        first_name: user.first_name || fallbackNames.first_name,
        last_name: user.last_name || fallbackNames.last_name,
        phone: user.phone || '',
        birth_date: user.birth_date || '',
        offer_type: user.offer_type || ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du client')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.put(`/api/admin/users/${id}`, form)
      navigate(`/admin/clients/${response.data.user.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du client')
    }
  }

  return (
    <CoachClientForm
      title={`Modifier les informations de ${clientName || 'la cliente'}`}
      form={form}
      setForm={setForm}
      error={error}
      onSubmit={handleSubmit}
    />
  )
}

export default CoachClientEditPage
