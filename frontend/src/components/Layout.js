import Header from './Header'
import Footer from './Footer'
import { useAuth } from '../hooks/useAuth'

export default function Layout({ children }) {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}