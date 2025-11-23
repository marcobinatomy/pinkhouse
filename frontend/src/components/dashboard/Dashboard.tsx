import { Link } from 'react-router-dom'
import { 
  FileText, 
  Search, 
  BarChart3, 
  TrendingUp,
  Upload,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const stats = [
  { name: 'Preventivi Caricati', value: '12', change: '+2 questa settimana', icon: FileText },
  { name: 'Ricerche Prezzi', value: '48', change: '+15 questa settimana', icon: Search },
  { name: 'Report Generati', value: '8', change: '+3 questa settimana', icon: BarChart3 },
  { name: 'Risparmio Totale', value: '€4.250', change: '+12% vs mese scorso', icon: TrendingUp },
]

const recentQuotes = [
  { id: 1, supplier: 'TechSupply Srl', amount: '€12.500', status: 'completed', date: '2 ore fa' },
  { id: 2, supplier: 'Office Plus', amount: '€3.200', status: 'analyzed', date: '5 ore fa' },
  { id: 3, supplier: 'Industrial Parts', amount: '€28.900', status: 'processing', date: '1 giorno fa' },
]

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  processing: 'bg-yellow-100 text-yellow-800',
  analyzed: 'bg-blue-100 text-blue-800',
  compared: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Benvenuto in PinkHouse</p>
        </div>
        <Link to="/quotes">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Carica Preventivo
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/quotes">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Carica Preventivo</h3>
                <p className="text-sm text-gray-500">Estrai dati con OCR</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/search">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Cerca Prezzi</h3>
                <p className="text-sm text-gray-500">Confronta su 10+ siti</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/reports">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Genera Report</h3>
                <p className="text-sm text-gray-500">Analisi AI dettagliata</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Quotes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preventivi Recenti</CardTitle>
              <CardDescription>Gli ultimi preventivi caricati</CardDescription>
            </div>
            <Link to="/quotes">
              <Button variant="outline" size="sm">
                Vedi tutti
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentQuotes.map((quote) => (
              <Link 
                key={quote.id} 
                to={`/quotes/${quote.id}`}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{quote.supplier}</p>
                    <p className="text-sm text-gray-500">{quote.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{quote.amount}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[quote.status as keyof typeof statusColors]}`}>
                    {quote.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
