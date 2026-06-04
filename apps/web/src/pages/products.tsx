import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  active: boolean
  stock: number
  category: { id: string; name: string } | null
}

type PaginatedResponse = {
  success: boolean
  data: Product[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export function ProductsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['products', page, search],
    queryFn: () =>
      api.get('/api/v1/products', { params: { page, limit: 20, search } }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link
          to="/products/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Adicionar Produto
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="block w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
        >
          Buscar
        </button>
      </form>

      {isLoading ? (
        <p className="text-zinc-500">Carregando...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50 text-left">
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Preço</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">
                      R$ {Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {product.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {product.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm('Excluir produto?')) {
                              deleteMutation.mutate(product.id)
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md bg-zinc-100 px-3 py-1 text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-zinc-500">
                Página {data.meta.page} de {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page >= data.meta.totalPages}
                className="rounded-md bg-zinc-100 px-3 py-1 text-sm disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
