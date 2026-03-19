import { useState } from 'react'
import { Newspaper, SearchCheck, Menu, X, BookCopy } from 'lucide-react'

const NavLink = ({ onClick, icon, text, isActive }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    <span>{text}</span>
  </button>
)

export default function Header({ onNavigate, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    {
      id: 'newsFeed',
      text: 'News Feed',
      icon: <Newspaper size={18} />,
    },
    {
      id: 'analysisTool',
      text: 'Analysis Tool',
      icon: <SearchCheck size={18} />,
    },
  ]

  return (
    <header className="bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <BookCopy className="text-blue-500" size={28} />
            <span className="font-bold text-xl text-white">Consti-Connect</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                onClick={() => onNavigate(item.id)}
                icon={item.icon}
                text={item.text}
                isActive={currentPage === item.id}
              />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-lg z-40">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setIsMenuOpen(false)
                }}
                icon={item.icon}
                text={item.text}
                isActive={currentPage === item.id}
              />
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
