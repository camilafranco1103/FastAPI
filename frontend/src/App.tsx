import Navbar from './components/Navbar'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pb-24">
        <AppRouter />
      </div>
    </div>
  )
}

export default App
