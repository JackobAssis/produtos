import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

type Category = { id: string; name: string }
type ProductImage = { id?: string; imageUrl: string; isPrimary: boolean; position: number }

export function ProductFormPage() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [active, setActive] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [images, setImages] = useState<ProductImage[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: categories } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/v1/categories').then((r) => r.data),
  })

  const { data: productData } = useQuery<{
    success: boolean
    data: {
      name: string
      description: string | null
      price: number
      categoryId: string | null
      active: boolean
      imageUrl: string | null
      images: ProductImage[]
    }
  }>({
    queryKey: ['product', id],
    queryFn: () => api.get(`/api/v1/products/${id}`).then((r) => r.data),
    enabled: isEditing,
  })

  useEffect(() => {
    if (productData?.data) {
      const p = productData.data
      setName(p.name)
      setDescription(p.description ?? '')
      setPrice(String(p.price))
      setCategoryId(p.categoryId ?? '')
      setActive(p.active)
      setImageUrl(p.imageUrl ?? '')
      setImages(p.images ?? [])
    }
  }, [productData])

  function addImage() {
    const url = imageUrl.trim()
    if (!url) return
    setImages((prev) => [
      ...prev,
      { imageUrl: url, isPrimary: prev.length === 0, position: prev.length },
    ])
    setImageUrl('')
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (prev[index]?.isPrimary && next.length > 0) {
        return next.map((img, i) => ({ ...img, isPrimary: i === 0 }))
      }
      return next
    })
  }

  function setPrimary(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        name,
        description: description || null,
        price: Number(price),
        categoryId: categoryId || null,
        active,
        imageUrl: (images.find((img) => img.isPrimary)?.imageUrl ?? imageUrl) || null,
        images: images.map((img, i) => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
          position: i,
        })),
      }

      if (isEditing) {
        await api.patch(`/api/v1/products/${id}`, payload)
      } else {
        await api.post('/api/v1/products', payload)
      }

      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/products')
    } catch {
      setError('Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">
        {isEditing ? 'Editar Produto' : 'Novo Produto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
            Nome
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-zinc-700">
            Preço
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-zinc-700">
            Categoria
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Sem categoria</option>
            {categories?.data.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Imagens</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              placeholder="URL da imagem..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addImage}
              className="rounded-md bg-zinc-100 px-3 py-2 text-sm hover:bg-zinc-200"
            >
              Adicionar
            </button>
          </div>

          {images.length > 0 && (
            <div className="mt-2 space-y-2">
              {images.map((img, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border bg-zinc-50 p-2">
                  <img src={img.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                  <span className="flex-1 truncate text-xs text-zinc-500">{img.imageUrl}</span>
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    className={`rounded px-2 py-0.5 text-xs ${
                      img.isPrimary
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                    }`}
                  >
                    {img.isPrimary ? 'Principal' : 'Definir'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-zinc-300"
          />
          <label htmlFor="active" className="text-sm font-medium text-zinc-700">
            Produto ativo
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Produto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="rounded-md bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
