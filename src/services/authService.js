import { getData, setData } from './db.js'
import { isValidEmail, isValidMobile } from '../utils/validators.js'

// Find an account by its normalized email address.
function findUserByEmail(email, users) {
  const normalizedEmail = (email || '').trim().toLowerCase()
  return (users || []).find((user) => user && typeof user.email === 'string'
    && user.email.toLowerCase() === normalizedEmail)
}

// Create an account after validating fields and checking duplicate email.
export function signUpUser(details) {
  details = details || {}
  const name = (details.name || '').trim()
  const email = (details.email || '').trim().toLowerCase()
  const mobile = (details.mobile || '').trim()
  const password = details.password || ''

  if (!name || !isValidEmail(email) || !isValidMobile(mobile) || password.trim().length < 6) {
    throw new Error('Enter a name, valid email and mobile number, and a password of at least 6 characters.')
  }

  const users = getData('users')
  if (findUserByEmail(email, users)) {
    throw new Error('An account with this email already exists.')
  }

  const user = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email,
    mobile,
    password,
    role: 'user',
    passengers: [],
    savedCards: [],
    upiIds: [],
  }
  users.push(user)
  setData('users', users)
  return user
}

// Verify email and password and return the matching account.
export function authenticateUser(email, password) {
  const users = getData('users')
  const user = findUserByEmail((email || '').trim(), users)
  if (!user || user.password !== password) {
    throw new Error('Email or password is incorrect.')
  }
  return user
}

// Confirm account recovery details without changing the saved password.
export function verifyRecoveryDetails(email, mobile) {
  const user = findUserByEmail((email || '').trim(), getData('users'))
  if (!user || typeof user.mobile !== 'string' || user.mobile.replace(/\D/g, '') !== (mobile || '').replace(/\D/g, '')) {
    throw new Error('The email and mobile number do not match an account.')
  }
}

// Save the current account identifier as this browser tab's signed-in session.
export function saveSession(user) {
  const session = { userId: user.id, role: user.role }
  setData('session', session)
  return session
}

// Check recovery details and replace the matching account password.
export function resetUserPassword(email, mobile, password) {
  const users = getData('users')
  const user = findUserByEmail((email || '').trim(), users)
  if (!user || typeof user.mobile !== 'string' || user.mobile.replace(/\D/g, '') !== (mobile || '').replace(/\D/g, '')) {
    throw new Error('The email and mobile number do not match an account.')
  }
  if (!password || password.trim().length < 6) {
    throw new Error('Choose a password with at least 6 characters.')
  }
  user.password = password
  setData('users', users)
}

// Update editable profile fields and safely managed saved payment identifiers.
export function updateUser(userId, updates) {
  const users = getData('users')
  const user = users.find((item) => item && item.id === userId)
  if (!user) {
    throw new Error('Your account could not be found.')
  }

  const name = (updates.name || '').trim()
  const mobile = (updates.mobile || '').trim()
  if (!name || !isValidMobile(mobile)) {
    throw new Error('Enter a name and a valid mobile number.')
  }

  user.name = name
  user.mobile = mobile
  user.passengers = Array.isArray(updates.passengers) ? updates.passengers : []
  user.savedCards = Array.isArray(updates.savedCards) ? updates.savedCards : []
  user.upiIds = Array.isArray(updates.upiIds) ? updates.upiIds : []
  setData('users', users)
  return user
}

// Return the account in storage identified by the saved session.
export function getSessionUser() {
  const session = getData('session')
  if (!session || !session.userId) {
    return null
  }
  const user = getData('users').find((item) => item && item.id === session.userId)
  if (!user) {
    return null
  }
  return {
    ...user,
    passengers: Array.isArray(user.passengers) ? user.passengers : [],
    savedCards: Array.isArray(user.savedCards) ? user.savedCards : [],
    upiIds: Array.isArray(user.upiIds) ? user.upiIds : [],
  }
}
