import { Link } from 'react-router-dom'

// Explain that the requested path does not exist and link back home.
export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase text-blue-800">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <Link className="mt-6 inline-block text-blue-800 underline" to="/">Return home</Link>
    </main>
  )
}
