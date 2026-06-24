import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CoachClientForm from '../components/CoachClientForm'
import api from '../services/api'

const CoachClientCreatePage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    last_name: '',
    first_name: '',
    phone: '',
    birth_date: '',
    offer_type: ''
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
      window.sessionStorage.setItem('coachClientsSuccess', 'Cliente ajoutée')
      navigate('/admin/clients', { state: { success: 'Cliente ajoutée' } })
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du client')
    }
  }

  return (
    <CoachClientForm
      title="Ajouter un client"
      form={form}
      setForm={setForm}
      error={error}
      onSubmit={handleSubmit}
    />
  )
}

export default CoachClientCreatePage
