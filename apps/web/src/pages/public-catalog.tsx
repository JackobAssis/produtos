import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

type Company = {
  name: string
  slug: string
  logoUrl: string | null
  bannerUrl: string | null
  whatsapp: string | null
}

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  imageUrl: string | null
  categoryId: string | null
  category: { id: string; name: string } | null
}

export function PublicCatalogPage() {
  const { slug } = useParams()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: companyData, isLoading: companyLoading } = useQuery<{
    success: boolean
    data: Company
  }>({
    queryKey: ['public-company', slug],
    queryFn: () => api.get(`/api/v1/catalog/${slug}`).then((r) => r.data),
    enabled: !!slug,
  })

  const { data: productsData, isLoading: productsLoading } = useQuery<{
    success: boolean
    data: Product[]
  }>({
    queryKey: ['public-products', slug, selectedCategory, search],
    queryFn: () =>
      api
        .get(`/api/v1/catalog/${slug}/products`, {
          params: { categoryId: selectedCategory, search },
        })
        .then((r) => r.data),
    enabled: !!slug,
  })

  const company = companyData?.data
  const products = productsData?.data ?? []

  const categories = Array.from(
    new Map(
      products
        .filter((p) => p.category)
        .map((p) => [p.category!.id, p.category!]),
    ).values(),
  )

  const whatsappLink = company?.whatsapp
    ? `https://wa.me/${company.whatsapp}?text=Olá, vi o catálogo e tenho interesse`
    : null

  if (companyLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loja não encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-4">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{company.name}</h1>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                >
                  Fale conosco no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-3 py-1 text-sm ${
                  !selectedCategory
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(cat.id === selectedCategory ? null : cat.id)
                  }
                  className={`rounded-full px-3 py-1 text-sm ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {productsLoading ? (
          <p className="text-zinc-500">Carregando produtos...</p>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-500">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-lg border bg-white"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  {product.category && (
                    <p className="mb-1 text-xs text-zinc-400">
                      {product.category.name}
                    </p>
                  )}
                  <h3 className="font-medium">{product.name}</h3>
                  {product.description && (
                    <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      R$ {Number(product.price).toFixed(2)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-sm text-zinc-400 line-through">
                        R$ {Number(product.comparePrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {whatsappLink && (
                    <a
                      href={`${whatsappLink}&text=Olá, tenho interesse em ${product.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Comprar via WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
