import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-bold">
            CatalogPro
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm text-zinc-600 hover:text-zinc-900">
              Dashboard
            </Link>
            <Link to="/products" className="text-sm text-zinc-600 hover:text-zinc-900">
              Produtos
            </Link>
            <Link to="/categories" className="text-sm text-zinc-600 hover:text-zinc-900">
              Categorias
            </Link>
            <Link to="/settings" className="text-sm text-zinc-600 hover:text-zinc-900">
              Configurações
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{user?.company?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
