import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import { resetUserPassword, verifyRecoveryDetails } from '../services/authService.js'

// Verify email and mobile locally, then let the user set a replacement password.
export default function ForgotPasswordPage() {
  const [details, setDetails] = useState({ email: '', mobile: '', password: '', confirmPassword: '' })
  const [verified, setVerified] = useState(false)

  function updateField(field, value) {
    setDetails((current) => ({ ...current, [field]: value }))
  }

  function verifyDetails(event) {
    event.preventDefault()
    try {
      verifyRecoveryDetails(details.email, details.mobile)
      setVerified(true)
    } catch (error) {
      toast.error(error.message)
    }
  }

  function updatePassword(event) {
    event.preventDefault()
    if (details.password !== details.confirmPassword) {
      toast.error('The passwords do not match.')
      return
    }
    try {
      resetUserPassword(details.email, details.mobile, details.password)
      toast.success('Password updated. You can now log in.')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Forgot password</h1>
      {!verified ? (
        <form onSubmit={verifyDetails} className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="mb-4 text-sm text-slate-600">Verify the email and mobile number saved on your account.</p>
          <Input id="email" label="Email" type="email" value={details.email} onChange={(event) => updateField('email', event.target.value)} required />
          <Input id="mobile" label="Mobile number" type="tel" value={details.mobile} onChange={(event) => updateField('mobile', event.target.value)} required />
          <Button type="submit">Verify details</Button>
        </form>
      ) : (
        <form onSubmit={updatePassword} className="rounded-lg border border-slate-200 bg-white p-6">
          <Input id="password" label="New password" type="password" minLength={6} value={details.password} onChange={(event) => updateField('password', event.target.value)} required />
          <Input id="confirm-password" label="Confirm password" type="password" minLength={6} value={details.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} required />
          <Button type="submit">Set new password</Button>
        </form>
      )}
      <Link className="mt-4 inline-block text-blue-800 underline" to="/login">Back to login</Link>
    </main>
  )
}
