import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Layout from '@/components/dashboard/Layout'
import Dashboard from '@/components/dashboard/Dashboard'
import QuotesPage from '@/components/quotes/QuotesPage'
import QuoteDetail from '@/components/quotes/QuoteDetail'
import SearchPage from '@/components/search/SearchPage'
import ReportsPage from '@/components/reports/ReportsPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="quotes/:id" element={<QuoteDetail />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
