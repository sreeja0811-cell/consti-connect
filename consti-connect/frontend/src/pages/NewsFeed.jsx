import { useState, useEffect } from 'react'
import axios from 'axios'
import NewsCard from '../components/NewsCard'
import SkeletonCard from '../components/SkeletonCard.jsx'
import ErrorDisplay from '../components/ErrorDisplay'

export default function NewsFeed({ onSelectArticle }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      setError(null)
      try {
        // The vite proxy will forward this to http://localhost:3000/api/news
        const response = await axios.get('/api/news')
        setNews(response.data)
      } catch (err) {
        console.error("Error fetching news:", err)
        setError(err.message || 'Failed to fetch news feed.')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, []) // Empty dependency array means this runs once on mount

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )
    }

    if (error) {
      return <ErrorDisplay message={error} />
    }

    if (news.length === 0) {
      return (
        <div className="text-center text-gray-500">
          <p>No news articles found.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onClick={() => onSelectArticle(article)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Recent News</h1>
      {renderContent()}
    </div>
  )
}
