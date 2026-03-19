import { ArrowLeft } from 'lucide-react'
import ConstitutionalArticleCard from '../components/ConstitutionalArticleCard'

export default function ArticleView({ article, onBack }) {
  if (!article) {
    return (
      <div className="text-center">
        <p className="text-gray-400">Article not found.</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
      >
        <ArrowLeft size={18} />
        Back to News
      </button>

      <article className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {article.title}
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Published on {new Date(article.publishedAt).toLocaleDateString()}
        </p>
        
        {/* Full article content */}
        <div className="prose prose-invert max-w-none text-gray-300">
          {/* We'll just use the snippet as the body for this example */}
          <p className="lead text-lg text-gray-200 mb-4">{article.snippet}</p>
          <p>{article.fullContent || "Full article content would be displayed here. For this demo, we are showing a placeholder."}</p>
          {/* You would map over paragraphs or render HTML content here */}
        </div>
      </article>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Related Constitutional Articles
        </h2>
        {article.relatedArticles && article.relatedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {article.relatedArticles.map((constiArticle) => (
              <ConstitutionalArticleCard
                key={constiArticle.id}
                article={constiArticle}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No related constitutional articles found for this news item.
          </p>
        )}
      </div>
    </div>
  )
}
