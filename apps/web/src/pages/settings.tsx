import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../contexts/auth'
import api from '../services/api'

export function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.company) {
      setName(user.company.name)
    }
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await api.patch('/api/v1/companies/me', {
        name,
        whatsapp: whatsapp || null,
      })
      setMessage('Salvo com sucesso!')
    } catch {
      setMessage('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const catalogUrl = user?.company?.slug
    ? `${window.location.origin}/catalog/${user.company.slug}`
    : null

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Configurações da Loja</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-medium">Informações</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <p
                className={`rounded-md p-3 text-sm ${
                  message === 'Erro ao salvar'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                {message}
              </p>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
                Nome da loja
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
              <label htmlFor="whatsapp" className="block text-sm font-medium text-zinc-700">
                WhatsApp (com DDD, apenas números)
              </label>
              <input
                id="whatsapp"
                type="tel"
                placeholder="5511999999999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-medium">Catálogo Público</h2>

          {catalogUrl && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-500">
                Compartilhe este link para divulgar seus produtos:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={catalogUrl}
                  className="block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(catalogUrl)}
                  className="rounded-md bg-zinc-100 px-3 py-2 text-sm hover:bg-zinc-200"
                >
                  Copiar
                </button>
              </div>
              <a
                href={catalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-blue-600 hover:text-blue-700"
              >
                Ver meu catálogo →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
