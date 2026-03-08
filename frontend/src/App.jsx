
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Documents from './pages/Documents'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-gray-900 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/documents" element={<Documents />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}