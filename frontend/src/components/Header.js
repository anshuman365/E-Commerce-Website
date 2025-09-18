import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          E-Commerce
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link href="/products">Products</Link>
          <Link href="/cart">Cart</Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span>Hello, {user.full_name}</span>
              <button onClick={logout} className="text-red-600">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}