import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-zinc-300">404</h1>
        <p className="mt-4 text-lg text-zinc-500">Página não encontrada</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
