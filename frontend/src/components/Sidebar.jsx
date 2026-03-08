import { NavLink } from 'react-router-dom'
import { MessageSquare, FileText, Building2 } from 'lucide-react'

export default function Sidebar() {
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`

  return (
    <aside className="w-64 bg-gray-900 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Enterprise</h1>
            <p className="text-gray-400 text-xs">Knowledge Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <NavLink to="/" end className={navClass}>
          <MessageSquare size={18} />
          Chat
        </NavLink>
        <NavLink to="/documents" className={navClass}>
          <FileText size={18} />
          Documents
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-500 text-xs text-center">Powered by Gemini + LangChain</p>
      </div>
    </aside>
  )
}