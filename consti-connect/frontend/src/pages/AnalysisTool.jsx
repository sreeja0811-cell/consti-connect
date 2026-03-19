import { useState } from 'react'
import axios from 'axios'
import ConstitutionalArticleCard from '../components/ConstitutionalArticleCard'
import ErrorDisplay from '../components/ErrorDisplay'
import { SearchCheck, Loader2 } from 'lucide-react'

export default function AnalysisTool() {
  const [text, setText] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) {
      setError('Please enter some text to analyze.')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await axios.post('/api/analyze', { text })
      setResults(response.data)
    } catch (err) {
      console.error("Error analyzing text:", err)
      setError(err.message || 'Failed to analyze text.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white text-center">
        Text Analysis Tool
      </h1>
      
      <p className="text-center text-gray-400">
        Paste any text below to find related constitutional articles.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="10"
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Paste your text here..."
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <SearchCheck size={20} />
          )}
          <span>{loading ? 'Analyzing...' : 'Analyze Text'}</span>
        </button>
      </form>

      {/* Results Section */}
      <div className="mt-10">
        {loading && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Analyzing...</h3>
            {/* Skeleton for results */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        )}

        {error && <ErrorDisplay message={error} />}

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Analysis Results
            </h3>
            {results.map((article) => (
              <ConstitutionalArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && text.length > 0 && (
           <p className="text-center text-gray-500">No related articles found for the provided text.</p>
        )}
      </div>
    </div>
  )
}
