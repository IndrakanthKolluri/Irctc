// Render a labeled form control with shared accessible styling.
export default function Input({ label, id, type = 'text', value, onChange, required = false, ...props }) {
  return (
    <label className="mb-4 block text-sm font-semibold text-slate-700" htmlFor={id}>
      {label}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-900 shadow-sm shadow-slate-950/[0.02] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        {...props}
      />
    </label>
  )
}
