import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Layout from '@/components/dashboard/Layout'
import OperatorDashboard from '@/components/dashboard/OperatorDashboard'
import QuotesPage from '@/components/quotes/QuotesPage'
import QuoteDetail from '@/components/quotes/QuoteDetail'
import SearchPage from '@/components/search/SearchPage'
import ComparisonPage from '@/components/comparison/ComparisonPage'
import ReportsPage from '@/components/reports/ReportsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<OperatorDashboard />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="quotes/:id" element={<QuoteDetail />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="comparison" element={<ComparisonPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
