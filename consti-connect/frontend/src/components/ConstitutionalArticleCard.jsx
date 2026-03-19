export default function ConstitutionalArticleCard({ article }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
      <h4 className="text-lg font-semibold text-blue-400 mb-1">
        {article.number}: {article.title}
      </h4>
      <p className="text-sm text-gray-300">
        {article.summary}
      </p>
    </div>
  )
}
