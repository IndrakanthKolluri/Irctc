import { useEffect, useState } from 'react'
import { setData } from '../services/db.js'
import { AuthContext } from './authContext.js'
import {
  authenticateUser,
  getSessionUser,
  saveSession,
  signUpUser,
} from '../services/authService.js'

// Share the current account and authentication actions with the page tree.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSessionUser())

  useEffect(() => {
    function handleStorageChange(event) {
      if (!event.key || event.key === 'session' || event.key === 'users') {
        setUser(getSessionUser())
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  function login(email, password, expectedRole) {
    const authenticatedUser = authenticateUser(email, password)
    if (expectedRole && authenticatedUser.role !== expectedRole) {
      throw new Error(expectedRole === 'admin'
        ? 'Use an administrator account on the admin login page.'
        : 'Administrator accounts must use the admin login page.')
    }
    saveSession(authenticatedUser)
    setUser(authenticatedUser)
    return authenticatedUser
  }

  function signUp(details) {
    const newUser = signUpUser(details)
    saveSession(newUser)
    setUser(newUser)
    return newUser
  }

  function logout() {
    setData('session', null)
    setUser(null)
  }

  function refreshUser() {
    const latestUser = getSessionUser()
    setUser(latestUser)
    return latestUser
  }

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
