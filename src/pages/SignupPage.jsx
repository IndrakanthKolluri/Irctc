import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import { AuthContext } from '../context/authContext.js'

// Register a new passenger account and sign it in immediately.
export default function SignupPage() {
  const { signUp } = useContext(AuthContext)
  const navigate = useNavigate()
  const [details, setDetails] = useState({ name: '', email: '', mobile: '', password: '' })

  function updateField(field, value) {
    setDetails((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    try {
      signUp(details)
      toast.success('Your account has been created.')
      navigate('/user/home', { replace: true })
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Create your account</h1>
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Input id="name" label="Full name" value={details.name} onChange={(event) => updateField('name', event.target.value)} required />
        <Input id="email" label="Email" type="email" value={details.email} onChange={(event) => updateField('email', event.target.value)} required />
        <Input id="mobile" label="Mobile number" type="tel" value={details.mobile} onChange={(event) => updateField('mobile', event.target.value)} required />
        <Input id="password" label="Password (at least 6 characters)" type="password" minLength={6} value={details.password} onChange={(event) => updateField('password', event.target.value)} required />
        <Button type="submit" className="w-full">Sign up</Button>
        <p className="mt-4 text-sm">Already registered? <Link className="text-blue-800 underline" to="/login">Login</Link></p>
      </form>
    </main>
  )
}
