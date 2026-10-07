import { Suspense, lazy, useContext } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Button from './components/Button.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AuthContext } from './context/authContext.js'
import { BookingProvider } from './context/BookingContext.jsx'
import { BookingContext } from './context/bookingContext.js'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const SignupPage = lazy(() => import('./pages/SignupPage.jsx'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'))
const PassengerDetailsPage = lazy(() => import('./pages/PassengerDetailsPage.jsx'))
const PaymentPage = lazy(() => import('./pages/PaymentPage.jsx'))
const PnrPage = lazy(() => import('./pages/PnrPage.jsx'))
const TicketPage = lazy(() => import('./pages/TicketPage.jsx'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

// Display navigation appropriate to the signed-in account.
function AppHeader() {
  const { user, logout } = useContext(AuthContext)
  const { clearDraft } = useContext(BookingContext)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    clearDraft()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 text-white shadow-lg shadow-slate-950/10 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5">
        <Link className="flex items-center gap-3 text-lg font-bold tracking-tight text-white sm:text-xl" to="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-blue-950/40">IR</span>
          <span>IRCTC <span className="font-medium text-slate-300"></span></span>
        </Link>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <Link className="text-sm font-medium text-slate-200 hover:text-white" to="/pnr">Check PNR</Link>
          {user && (
            <>
              {user.role === 'admin' ? (
                <Link className="text-sm font-medium text-slate-200 hover:text-white" to="/admin">Admin</Link>
              ) : (
                <>
                  <Link className="text-sm font-medium text-slate-200 hover:text-white" to="/user/home">Home</Link>
                  <Link className="text-sm font-medium text-slate-200 hover:text-white" to="/profile">Profile</Link>
                  <Link className="text-sm font-medium text-slate-200 hover:text-white" to="/my-bookings">My Bookings</Link>
                </>
              )}
              <Button onClick={handleLogout} className="border border-white/15 bg-white/10 px-4 py-2 text-sm shadow-none hover:bg-white/20">Logout</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

// Keep route declarations separate from authentication provider setup.
function AppRoutes() {
  return (
    <BrowserRouter>
      <AppHeader />
      <Suspense fallback={<p className="p-8 text-center text-slate-600">Loading page…</p>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user/home" element={<ProtectedRoute role="user"><HomePage userHome /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage role="user" />} />
          <Route path="/admin-login" element={<LoginPage role="admin" />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/search" element={<ProtectedRoute role="user"><SearchPage /></ProtectedRoute>} />
          <Route path="/passengers" element={<ProtectedRoute role="user"><PassengerDetailsPage /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute role="user"><PaymentPage /></ProtectedRoute>} />
          <Route path="/pnr" element={<PnrPage />} />
          <Route path="/ticket/:pnr" element={<TicketPage />} />
          <Route path="/my-bookings" element={<ProtectedRoute role="user"><MyBookingsPage /></ProtectedRoute>} />
          <Route
            path="/profile"
            element={<ProtectedRoute role="user"><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>}
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

// Wrap routes in shared authentication and render-failure handling.
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3500} />
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
