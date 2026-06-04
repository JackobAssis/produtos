import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/auth'
import { ProtectedRoute } from './components/shared/protected-route'
import { AdminLayout } from './layouts/admin-layout'
import { LoginPage } from './pages/login'
import { RegisterPage } from './pages/register'
import { DashboardPage } from './pages/dashboard'
import { SettingsPage } from './pages/settings'
import { ProductsPage } from './pages/products'
import { ProductFormPage } from './pages/product-form'
import { CategoriesPage } from './pages/categories'
import { PublicCatalogPage } from './pages/public-catalog'
import { NotFoundPage } from './pages/not-found'
import { ToastProvider } from './components/shared/toast'
import './globals.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/catalog/:slug" element={<PublicCatalogPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="categories" element={<CategoriesPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
