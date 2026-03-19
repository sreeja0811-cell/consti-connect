import { BookCheck } from 'lucide-react'

export default function NewsCard({ article, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out group hover:shadow-blue-500/30 hover:ring-2 hover:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {article.snippet}
        </p>
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
            <BookCheck size={14} />
            {article.relatedArticles.length} Related Articles
          </span>
        </div>
      </div>
    </button>
  )
}
