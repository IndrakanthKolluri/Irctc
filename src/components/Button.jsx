// Keep button appearance and disabled behavior consistent across forms.
export default function Button({ children, type = 'button', disabled = false, onClick, className = '' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl bg-blue-700 px-5 py-2.5 font-semibold text-white shadow-sm shadow-blue-950/10 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm ${className}`}
    >
      {children}
    </button>
  )
}
