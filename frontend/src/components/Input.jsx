export default function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}

      <input
        {...props}
        className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${error ? "border-red-500" : "border-gray-300"}`}
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
