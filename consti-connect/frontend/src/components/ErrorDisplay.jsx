import { AlertTriangle } from 'lucide-react'

export default function ErrorDisplay({ message }) {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
      <AlertTriangle className="text-red-400" size={20} />
      <div>
        <strong className="font-semibold">Error:</strong>
        <span className="block sm:inline ml-1">
          {message || 'An unknown error occurred.'}
        </span>
      </div>
    </div>
  )
}
