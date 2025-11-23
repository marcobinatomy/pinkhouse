import { Link } from 'react-router-dom'
import { 
  FileText, 
  Search, 
  BarChart3, 
  TrendingUp,
  Upload,
  ArrowRight,
  Camera,
  Clock,
  TrendingDown,
  Zap,
  Target
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const stats = [
  { name: 'Risparmio Mese', value: '€12.458', change: '+23%', trend: 'up', icon: TrendingDown, color: 'green' },
  { name: 'Preventivi', value: '47', change: '38 analizzati', trend: 'neutral', icon: FileText, color: 'blue' },
  { name: 'Ricerche', value: '312', change: '189 scan, 123 manuali', trend: 'up', icon: Search, color: 'purple' },
  { name: 'Confronti', value: '28', change: '19 report generati', trend: 'up', icon: BarChart3, color: 'orange' },
]

const savingsData = [
  { month: 'Ago', savings: 8400 },
  { month: 'Set', savings: 9200 },
  { month: 'Ott', savings: 10500 },
  { month: 'Nov', savings: 11800 },
  { month: 'Dic', savings: 12458 },
]

const categoryData = [
  { name: 'Elettronica', value: 4500, color: '#3b82f6' },
  { name: 'Arredamento', value: 3200, color: '#8b5cf6' },
  { name: 'Informatica', value: 2800, color: '#06b6d4' },
  { name: 'Cancelleria', value: 1958, color: '#f59e0b' },
]

const supplierPerformance = [
  { name: 'TechSupply', savings: 3200, orders: 12, rating: 4.5 },
  { name: 'Office Plus', savings: 2800, orders: 8, rating: 4.2 },
  { name: 'Industrial Parts', savings: 2400, orders: 6, rating: 4.7 },
  { name: 'Digital Store', savings: 1900, orders: 5, rating: 4.0 },
  { name: 'Prime Office', savings: 1658, orders: 4, rating: 3.8 },
]

const recentActivity = [
  { id: 1, type: 'quote', action: 'Preventivo caricato', supplier: 'TechSupply Srl', amount: '€12.500', time: '2 ore fa', status: 'completed' },
  { id: 2, type: 'search', action: 'Ricerca prezzi', item: 'Monitor Dell 27"', results: 8, time: '3 ore fa', status: 'completed' },
  { id: 3, type: 'report', action: 'Report generato', quote: 'Office Plus', savings: '€420', time: '5 ore fa', status: 'completed' },
  { id: 4, type: 'scan', action: 'Scansione barcode', items: 5, time: '1 giorno fa', status: 'completed' },
]

const teamStats = [
  { name: 'Marco R.', scans: 45, savings: 3200, efficiency: 94 },
  { name: 'Sara B.', scans: 38, savings: 2800, efficiency: 89 },
  { name: 'Luca M.', scans: 32, savings: 2400, efficiency: 87 },
  { name: 'Anna P.', scans: 28, savings: 1950, efficiency: 85 },
]

const recentQuotes = [
  { id: 1, supplier: 'TechSupply Srl', date: '2 ore fa', amount: '€12.500', status: 'completed' },
  { id: 2, supplier: 'Office Plus', date: '5 ore fa', amount: '€8.320', status: 'analyzed' },
  { id: 3, supplier: 'Digital Store', date: '1 giorno fa', amount: '€5.670', status: 'compared' },
  { id: 4, supplier: 'Prime Office', date: '2 giorni fa', amount: '€3.200', status: 'pending' },
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
  const avgScanTime = 8 // minuti
  const prevScanTime = 45 // minuti
  const timeSaved = 192 // ore/mese

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Panoramica completa delle attività</p>
        </div>
        <div className="flex gap-2">
          <Link to="/search">
            <Button variant="outline" className="gap-2">
              <Camera className="h-4 w-4" />
              Scansiona Ora
            </Button>
          </Link>
          <Link to="/quotes">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Carica Preventivo
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {stat.change}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 flex items-center justify-center`}>
                  <stat.icon className={`h-7 w-7 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600`} />
          </Card>
        ))}
      </div>

      {/* Efficiency Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">⚡ Tempo Medio Ricerca</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-4xl font-bold text-blue-900">{avgScanTime}</p>
                  <p className="text-blue-700">min</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">Prima: {prevScanTime} min (-82%)</p>
              </div>
              <Clock className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">💰 Convenienza Media</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-4xl font-bold text-green-900">18.5</p>
                  <p className="text-green-700">%</p>
                </div>
                <p className="text-xs text-green-600 mt-2">60% preventivi, 40% web</p>
              </div>
              <Target className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">⏱️ Tempo Risparmiato</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-4xl font-bold text-purple-900">{timeSaved}</p>
                  <p className="text-purple-700">ore/mese</p>
                </div>
                <p className="text-xs text-purple-600 mt-2">Efficienza +340%</p>
              </div>
              <Zap className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Savings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Trend Risparmio</CardTitle>
            <CardDescription>Ultimi 5 mesi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}`} />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Breakdown per Categoria</CardTitle>
            <CardDescription>Risparmio per categoria prodotto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-semibold">€{cat.value.toLocaleString('it-IT')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Supplier Performance & Team Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top 5 Fornitori</CardTitle>
            <CardDescription>Per risparmio generato</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplierPerformance.map((supplier, idx) => (
                <div key={supplier.name} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                    idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-gray-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{supplier.name}</span>
                      <span className="text-green-600 font-bold">€{supplier.savings.toLocaleString('it-IT')}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{supplier.orders} ordini</span>
                      <span className="flex items-center gap-1">
                        ⭐ {supplier.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>👥 Performance Team</CardTitle>
            <CardDescription>Statistiche utenti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamStats.map((member) => (
                <div key={member.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{member.name}</span>
                    <Badge variant="secondary">{member.efficiency}% efficienza</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{member.scans} scansioni</span>
                    <span className="text-green-600 font-semibold">€{member.savings} risparmiati</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${member.efficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>🕒 Attività Recenti</CardTitle>
          <CardDescription>Ultime azioni del team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.type === 'quote' ? 'bg-blue-100' :
                  activity.type === 'search' ? 'bg-green-100' :
                  activity.type === 'report' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  {activity.type === 'quote' && <FileText className="h-5 w-5 text-blue-600" />}
                  {activity.type === 'search' && <Search className="h-5 w-5 text-green-600" />}
                  {activity.type === 'report' && <BarChart3 className="h-5 w-5 text-purple-600" />}
                  {activity.type === 'scan' && <Camera className="h-5 w-5 text-orange-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    {activity.supplier || activity.item || activity.quote}
                    {activity.amount && ` • ${activity.amount}`}
                    {activity.results && ` • ${activity.results} risultati`}
                    {activity.savings && ` • Risparmio: ${activity.savings}`}
                    {activity.items && ` • ${activity.items} articoli`}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={statusColors[activity.status as keyof typeof statusColors]}>
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
