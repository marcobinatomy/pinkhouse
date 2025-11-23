/**
 * PinkHouse - Smart Procurement Platform
 * Tool creato da Marco Salvatici e Nicola Casarosa per binatomy.com
 * Data: 23 Novembre 2024
 * 
 * Dashboard Operatore - Focus: Azione Immediata
 * ZERO grafici, ZERO statistiche - Solo ricerca rapida e richieste attive
 */

import { Link } from 'react-router-dom'
import { useState } from 'react'
import { 
  FileText, 
  Search, 
  Camera,
  Upload,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Mock data richieste attive
const activeRequests = [
  {
    id: 1,
    productName: 'Mouse Logitech MX Master 3',
    productCode: 'EAN 5099206085972',
    quantity: 5,
    suppliersTotal: 10,
    suppliersResponded: 5,
    pendingSuppliers: ['Fornitore A', 'Fornitore C', 'Fornitore E'],
    bestPrice: 84.50,
    savings: 52.45,
    isComplete: false,
    createdAt: '2 ore fa',
    status: 'pending'
  },
  {
    id: 2,
    productName: 'Tastiera Corsair K95 RGB',
    productCode: 'EAN 0843591070454',
    quantity: 3,
    suppliersTotal: 8,
    suppliersResponded: 8,
    bestPrice: 189.90,
    savings: 45.20,
    isComplete: true,
    createdAt: '5 ore fa',
    status: 'completed'
  },
  {
    id: 3,
    productName: 'Monitor Dell 27" UltraSharp',
    productCode: 'EAN 5099206085972',
    quantity: 2,
    suppliersTotal: 6,
    suppliersResponded: 4,
    pendingSuppliers: ['Fornitore B', 'Fornitore F'],
    bestPrice: 312.00,
    savings: 68.00,
    isComplete: false,
    createdAt: '1 giorno fa',
    status: 'pending'
  }
]

const recentNotifications = [
  { id: 1, type: 'success', message: 'Preventivo Fornitore B ricevuto', time: '2 min fa', icon: CheckCircle },
  { id: 2, type: 'warning', message: 'Preventivo Fornitore A in scadenza', time: '1 ora fa', icon: AlertCircle },
  { id: 3, type: 'success', message: 'Report generato per Tastiera Corsair', time: '3 ore fa', icon: FileText },
  { id: 4, type: 'info', message: '5 nuovi preventivi ricevuti oggi', time: '5 ore fa', icon: Package }
]

export default function OperatorDashboard() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleQuickSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Operatore</h1>
        <p className="text-gray-500 mt-1">Ricerca rapida e gestione richieste</p>
      </div>

      {/* Quick Search Widget - FOCUS PRINCIPALE */}
      <Card className="border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-white">
        <CardHeader>
          <CardTitle className="text-2xl">🔍 Cerca Articolo</CardTitle>
          <CardDescription>
            Scansiona, carica foto o cerca per testo - Il modo più veloce per iniziare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Scanner Barcode */}
            <Link to="/search?mode=scan" className="block">
              <Button 
                size="lg" 
                className="w-full h-24 flex flex-col gap-2 bg-pink-600 hover:bg-pink-700"
              >
                <Camera className="h-8 w-8" />
                <span className="text-sm">Scansiona Barcode</span>
              </Button>
            </Link>

            {/* Upload Foto */}
            <Link to="/search?mode=photo" className="block">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-24 flex flex-col gap-2 border-2 hover:bg-gray-50"
              >
                <Upload className="h-8 w-8" />
                <span className="text-sm">Carica Foto</span>
              </Button>
            </Link>

            {/* Ricerca Testo - span 2 colonne */}
            <div className="md:col-span-2 flex gap-2">
              <Input
                placeholder="Cerca per nome articolo, codice, descrizione..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                className="h-24 text-lg"
              />
              <Button 
                size="lg"
                onClick={handleQuickSearch}
                className="h-24 px-8 bg-pink-600 hover:bg-pink-700"
              >
                <Search className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <span>💡 Suggerimento:</span>
            <span>Scansiona il barcode per risultati immediati</span>
          </div>
        </CardContent>
      </Card>

      {/* Richieste in Corso */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            📋 Richieste in Corso ({activeRequests.filter(r => !r.isComplete).length})
          </h2>
          <Link to="/requests">
            <Button variant="outline">
              Vedi Tutte <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {activeRequests.map((request) => (
            <Card key={request.id} className={request.isComplete ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{request.productName}</h3>
                      {request.isComplete ? (
                        <Badge className="bg-green-600">✅ Completo</Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-600 text-orange-600">
                          ⏳ In Attesa
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>{request.productCode}</span>
                      <span>•</span>
                      <span>Quantità: {request.quantity}</span>
                      <span>•</span>
                      <span>{request.createdAt}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          Preventivi: {request.suppliersResponded}/{request.suppliersTotal}
                        </span>
                        <span className="font-medium">
                          {Math.round((request.suppliersResponded / request.suppliersTotal) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${request.isComplete ? 'bg-green-600' : 'bg-orange-600'}`}
                          style={{ width: `${(request.suppliersResponded / request.suppliersTotal) * 100}%` }}
                        />
                      </div>
                    </div>

                    {!request.isComplete && request.pendingSuppliers && (
                      <p className="text-sm text-gray-600">
                        ⏰ In attesa di: {request.pendingSuppliers.join(', ')}
                      </p>
                    )}

                    {request.isComplete && (
                      <div className="mt-2 p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-600">Miglior Prezzo:</span>
                            <span className="ml-2 text-lg font-bold text-green-600">
                              €{request.bestPrice}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Risparmio:</span>
                            <span className="ml-2 text-lg font-bold text-green-600">
                              €{request.savings}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {request.isComplete ? (
                      <>
                        <Link to={`/comparison?id=${request.id}`}>
                          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                            Vedi Confronto
                          </Button>
                        </Link>
                        <Link to={`/reports?generate=${request.id}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            Genera Report
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link to={`/comparison?id=${request.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          Vedi Stato
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activeRequests.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Nessuna richiesta attiva</p>
              <p className="text-sm mt-1">Inizia una nuova ricerca per creare una richiesta</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notifiche Recenti */}
      <Card>
        <CardHeader>
          <CardTitle>🔔 Notifiche Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentNotifications.map((notification) => {
              const Icon = notification.icon
              return (
                <div 
                  key={notification.id} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`
                    ${notification.type === 'success' ? 'text-green-600' : ''}
                    ${notification.type === 'warning' ? 'text-orange-600' : ''}
                    ${notification.type === 'info' ? 'text-blue-600' : ''}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {notification.time}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/quotes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Preventivi</p>
                  <p className="text-sm text-gray-500">Carica e gestisci</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Report AI</p>
                  <p className="text-sm text-gray-500">Genera analisi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/settings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Package className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold">Impostazioni</p>
                  <p className="text-sm text-gray-500">Configura fornitori</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
