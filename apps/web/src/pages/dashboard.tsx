import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/auth'
import api from '../services/api'

export function DashboardPage() {
  const { user } = useAuth()

  const { data: productsData } = useQuery({
    queryKey: ['products', 1, ''],
    queryFn: () =>
      api
        .get('/api/v1/products', { params: { page: 1, limit: 1 } })
        .then((r) => r.data),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/v1/categories').then((r) => r.data),
  })

  const totalProducts = productsData?.meta?.total ?? 0
  const totalCategories = categoriesData?.data?.length ?? 0

  const catalogUrl = user?.company?.slug
    ? `${window.location.origin}/catalog/${user.company.slug}`
    : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Bem-vindo, {user?.name}!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-zinc-500">Total de Produtos</p>
          <p className="mt-1 text-3xl font-bold">{totalProducts}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-zinc-500">Produtos Ativos</p>
          <p className="mt-1 text-3xl font-bold">{productsData?.meta?.total ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-zinc-500">Categorias</p>
          <p className="mt-1 text-3xl font-bold">{totalCategories}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          to="/products/new"
          className="rounded-lg border bg-white p-6 text-center hover:shadow-sm"
        >
          <p className="text-sm font-medium text-blue-600">Adicionar Produto</p>
        </Link>
        {catalogUrl && (
          <a
            href={catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border bg-white p-6 text-center hover:shadow-sm"
          >
            <p className="text-sm font-medium text-blue-600">Ver Catálogo</p>
          </a>
        )}
        <Link
          to="/settings"
          className="rounded-lg border bg-white p-6 text-center hover:shadow-sm"
        >
          <p className="text-sm font-medium text-blue-600">Configurar WhatsApp</p>
        </Link>
      </div>
    </div>
  )
}
