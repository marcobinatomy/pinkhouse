/**
 * PinkHouse - Smart Procurement Platform
 * Tool creato da Marco Salvatici e Nicola Casarosa per binatomy.com
 * Data: 23 Novembre 2024
 * 
 * Analytics Page - Per Manager
 * TUTTI i grafici, KPI, statistiche, ROI qui
 */

import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  Target,
  Award
} from 'lucide-react'

// Dati grafici
const savingsData = [
  { month: 'Mag', savings: 6800, orders: 89 },
  { month: 'Giu', savings: 7500, orders: 95 },
  { month: 'Lug', savings: 8900, orders: 103 },
  { month: 'Ago', savings: 8400, orders: 98 },
  { month: 'Set', savings: 9200, orders: 107 },
  { month: 'Ott', savings: 10500, orders: 121 },
  { month: 'Nov', savings: 11800, orders: 134 },
  { month: 'Dic', savings: 12458, orders: 142 },
]

const categoryData = [
  { name: 'Elettronica', value: 4500, color: '#3b82f6' },
  { name: 'Arredamento', value: 3200, color: '#8b5cf6' },
  { name: 'Informatica', value: 2800, color: '#06b6d4' },
  { name: 'Cancelleria', value: 1958, color: '#f59e0b' },
]

const supplierPerformance = [
  { name: 'Fornitore A', savings: 3200, orders: 45, rating: 4.8, responseTime: 18 },
  { name: 'Fornitore B', savings: 2800, orders: 38, rating: 4.5, responseTime: 24 },
  { name: 'Fornitore C', savings: 2400, orders: 32, rating: 4.9, responseTime: 12 },
  { name: 'Fornitore D', savings: 1900, orders: 28, rating: 4.2, responseTime: 36 },
  { name: 'Fornitore E', savings: 1658, orders: 21, rating: 4.0, responseTime: 48 },
]

const efficiencyMetrics = [
  { metric: 'Tempo Medio', before: 105, after: 3, unit: 'minuti' },
  { metric: 'Ordini/Giorno', before: 8, after: 45, unit: 'ordini' },
  { metric: 'Accuracy OCR', before: 75, after: 96, unit: '%' },
  { metric: 'Response Rate', before: 60, after: 89, unit: '%' },
]

export default function AnalyticsPage() {
  const totalSavings = savingsData.reduce((acc, d) => acc + d.savings, 0)
  const avgMonthly = Math.round(totalSavings / savingsData.length)
  const totalOrders = savingsData.reduce((acc, d) => acc + d.orders, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Andamento PinkHouse</h1>
        <p className="text-gray-500 mt-1">Statistiche, performance e ROI aziendale</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risparmio Totale</p>
                <p className="text-2xl font-bold text-green-600">€{totalSavings.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Ultimi 8 mesi</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+23% vs anno scorso</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ordini Processati</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Ultimi 8 mesi</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-blue-600">
              <TrendingUp className="h-4 w-4" />
              <span>+18% efficienza</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Medio</p>
                <p className="text-2xl font-bold">3 min</p>
                <p className="text-xs text-gray-500 mt-1">Per ordine</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-purple-600">
              <TrendingDown className="h-4 w-4" />
              <span>-97% vs manuale</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ROI Annuale</p>
                <p className="text-2xl font-bold text-pink-600">2.381%</p>
                <p className="text-xs text-gray-500 mt-1">Payback: 2 settimane</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Target className="h-6 w-6 text-pink-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-pink-600">
              <Award className="h-4 w-4" />
              <span>Eccellente</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafici Principali */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Risparmio */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Trend Risparmio Mensile</CardTitle>
            <CardDescription>Evoluzione ultimi 8 mesi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`€${value}`, 'Risparmio']}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600">Media Mensile:</span>
                <span className="ml-2 font-bold text-green-600">€{avgMonthly.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Proiezione Anno:</span>
                <span className="ml-2 font-bold text-green-600">€{(avgMonthly * 12).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Categorie */}
        <Card>
          <CardHeader>
            <CardTitle>🥧 Risparmio per Categoria</CardTitle>
            <CardDescription>Distribuzione per tipo prodotto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
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
            <div className="mt-4 grid grid-cols-2 gap-3">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-gray-600">{cat.name}</span>
                  <span className="text-sm font-semibold ml-auto">€{cat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Fornitori */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Performance Fornitori</CardTitle>
          <CardDescription>Top 5 fornitori per risparmio generato</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplierPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="savings" fill="#3b82f6" name="Risparmio €" />
              <Bar dataKey="orders" fill="#8b5cf6" name="Ordini" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-3">
            {supplierPerformance.map((supplier, idx) => (
              <div key={supplier.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge className={idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-700'}>
                    #{idx + 1}
                  </Badge>
                  <div>
                    <p className="font-semibold">{supplier.name}</p>
                    <p className="text-sm text-gray-600">{supplier.orders} ordini</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Risparmio</p>
                    <p className="font-bold text-green-600">€{supplier.savings}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-bold">⭐ {supplier.rating}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Risposta</p>
                    <p className="font-bold">{supplier.responseTime}h</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Efficienza Prima/Dopo */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Efficienza: Prima vs Dopo PinkHouse</CardTitle>
          <CardDescription>Impatto misurabile sulla produttività</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {efficiencyMetrics.map((metric) => (
              <div key={metric.metric} className="p-4 bg-gradient-to-br from-gray-50 to-white border rounded-lg">
                <p className="text-sm text-gray-600 mb-3">{metric.metric}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Prima:</span>
                    <span className="text-lg font-bold text-red-600">{metric.before}{metric.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Dopo:</span>
                    <span className="text-lg font-bold text-green-600">{metric.after}{metric.unit}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                      {metric.before > metric.after ? (
                        <>
                          <TrendingDown className="h-4 w-4" />
                          <span>-{Math.round((1 - metric.after / metric.before) * 100)}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          <span>+{Math.round((metric.after / metric.before - 1) * 100)}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights AI */}
      <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-white">
        <CardHeader>
          <CardTitle>🤖 Insights AI</CardTitle>
          <CardDescription>Analisi automatica dei dati</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-semibold">Web conviene nel 62% dei casi</p>
                <p className="text-sm text-gray-600">Amazon ed ePRICE hanno i prezzi più competitivi per elettronica</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-semibold">Fornitore C è il più veloce (12h media risposta)</p>
                <p className="text-sm text-gray-600">Considera di aumentare gli ordini con questo fornitore</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold">Accuracy OCR migliorata del 21%</p>
                <p className="text-sm text-gray-600">Continuare training del modello con nuovi preventivi</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold">Target €150K risparmi annui raggiungibile</p>
                <p className="text-sm text-gray-600">Al trend attuale, supererai l'obiettivo del 8%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
