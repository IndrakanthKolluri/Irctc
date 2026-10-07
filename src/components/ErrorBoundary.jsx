import { Component } from 'react'

// Show a safe recovery screen instead of a blank page after a render error.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('The application encountered a rendering error.', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-slate-600">Reload the page and try again.</p>
          <button className="mt-5 rounded-md bg-blue-800 px-4 py-2 text-white" onClick={() => window.location.reload()}>
            Reload
          </button>
        </main>
      )
    }
    return this.props.children
  }
}
