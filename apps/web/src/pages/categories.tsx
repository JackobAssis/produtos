import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

type Category = { id: string; name: string; order: number; active: boolean }

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const { data, isLoading } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/v1/categories').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => api.post('/api/v1/categories', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setNewName('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.patch(`/api/v1/categories/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (newName.trim()) {
      createMutation.mutate(newName.trim())
    }
  }

  function handleEdit(id: string) {
    const cat = data?.data.find((c) => c.id === id)
    if (cat) {
      setEditingId(id)
      setEditingName(cat.name)
    }
  }

  function handleSaveEdit() {
    if (editingId && editingName.trim()) {
      updateMutation.mutate({ id: editingId, name: editingName.trim() })
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categorias</h1>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Nova categoria..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="block w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      {isLoading ? (
        <p className="text-zinc-500">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {data?.data.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
            >
              {editingId === category.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="block w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-md bg-zinc-100 px-3 py-1 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Excluir categoria?')) {
                          deleteMutation.mutate(category.id)
                        }
                      }}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {data?.data.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhuma categoria cadastrada.</p>
          )}
        </div>
      )}
    </div>
  )
}
