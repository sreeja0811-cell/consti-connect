import { useState } from 'react'
import Header from './components/Header'
import NewsFeed from './pages/NewsFeed'
import ArticleView from './pages/ArticleView'
import AnalysisTool from './pages/AnalysisTool'

function App() {
  const [page, setPage] = useState('newsFeed') // 'newsFeed', 'articleView', 'analysisTool'
  const [selectedArticle, setSelectedArticle] = useState(null)

  const handleSelectArticle = (article) => {
    setSelectedArticle(article)
    setPage('articleView')
  }

  const handleGoBack = () => {
    setSelectedArticle(null)
    setPage('newsFeed')
  }

  const renderPage = () => {
    switch (page) {
      case 'newsFeed':
        return <NewsFeed onSelectArticle={handleSelectArticle} />
      case 'articleView':
        return <ArticleView article={selectedArticle} onBack={handleGoBack} />
      case 'analysisTool':
        return <AnalysisTool />
      default:
        return <NewsFeed onSelectArticle={handleSelectArticle} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={setPage} currentPage={page} />
      <main className="flex-1 container mx-auto p-4 md:p-8 mt-16">
        {renderPage()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm border-t border-gray-800">
        © 2025 Consti-Connect. All rights reserved.
      </footer>
    </div>
  )
}

export default App
