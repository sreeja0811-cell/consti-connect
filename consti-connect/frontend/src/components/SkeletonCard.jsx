export default function SkeletonCard() {
  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden p-5 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
      <div className="flex justify-end">
        <div className="h-6 bg-gray-700 rounded-full w-32"></div>
      </div>
    </div>
  )
}
