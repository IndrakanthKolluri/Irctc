import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import { AuthContext } from '../context/authContext.js'

// Let existing users sign in and send each role to its own start page.
export default function LoginPage({ role = 'user' }) {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isAdminLogin = role === 'admin'

  function handleSubmit(event) {
    event.preventDefault()
    try {
      const user = login(email, password, role)
      toast.success(`Welcome, ${user.name}.`)
      navigate(user.role === 'admin' ? '/admin' : '/user/home', { replace: true })
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <div className="mb-7 text-center">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-lg font-black text-blue-800 shadow-inner">IR</span>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-950">{isAdminLogin ? 'Admin Login' : 'Welcome back'}</h1>
        <p className="text-sm text-slate-600">
        {isAdminLogin ? 'Sign in to manage stations, trains, and bookings.' : 'Sign in to search trains and manage your bookings.'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/[0.06] sm:p-8">
        <Input id="email" label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input id="password" label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Button type="submit" className="w-full">{isAdminLogin ? 'Login as admin' : 'Login as user'}</Button>
        <div className="mt-5 flex justify-between text-sm">
          <Link className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900" to="/forgot-password">Forgot password?</Link>
          {!isAdminLogin && <Link className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900" to="/signup">Create account</Link>}
        </div>
        {isAdminLogin && <p className="mt-5 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">Demo admin: <strong>admin@irctc.com / admin123</strong></p>}
      </form>
      <div className="mt-6 text-center"><Link className="text-sm font-medium text-slate-500 hover:text-blue-800" to="/">← Back to home</Link></div>
    </main>
  )
}
