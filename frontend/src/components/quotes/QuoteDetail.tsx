import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  FileText, 
  Search, 
  BarChart3,
  ExternalLink,
  TrendingDown,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'

// Mock data
const mockQuoteDetail = {
  id: 1,
  original_filename: 'preventivo_techsupply.pdf',
  supplier: {
    name: 'TechSupply Srl',
    email: 'info@techsupply.it',
    phone: '+39 02 1234567'
  },
  total_amount: 12500,
  status: 'completed',
  created_at: '2025-01-15T10:30:00Z',
  ocr_confidence: 0.94,
  items: [
    {
      id: 1,
      description: 'Monitor Dell UltraSharp U2722D 27"',
      sku: 'DELL-U2722D',
      quantity: 10,
      unit_price: 450,
      total_price: 4500,
      comparisons: [
        { source: 'Amazon', price: 399, url: 'https://amazon.it/...', availability: 'in_stock' },
        { source: 'ePRICE', price: 419, url: 'https://eprice.it/...', availability: 'in_stock' },
        { source: 'Unieuro', price: 449, url: 'https://unieuro.it/...', availability: 'limited' },
      ]
    },
    {
      id: 2,
      description: 'Tastiera Logitech MX Keys',
      sku: 'LOG-MXKEYS',
      quantity: 10,
      unit_price: 120,
      total_price: 1200,
      comparisons: [
        { source: 'Amazon', price: 99, url: 'https://amazon.it/...', availability: 'in_stock' },
        { source: 'MediaWorld', price: 109, url: 'https://mediaworld.it/...', availability: 'in_stock' },
      ]
    },
    {
      id: 3,
      description: 'Mouse Logitech MX Master 3S',
      sku: 'LOG-MXM3S',
      quantity: 10,
      unit_price: 110,
      total_price: 1100,
      comparisons: [
        { source: 'Amazon', price: 89, url: 'https://amazon.it/...', availability: 'in_stock' },
        { source: 'TrovaPrezzi', price: 95, url: 'https://trovaprezzi.it/...', availability: 'in_stock' },
      ]
    },
  ]
}

export default function QuoteDetail() {
  const { id } = useParams()
  const [searching, setSearching] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  
  // In produzione: fetch da API usando id
  const quote = mockQuoteDetail
  console.log('Loading quote:', id)

  // Calcola risparmi
  const calculateSavings = () => {
    let totalQuote = 0
    let totalBest = 0
    
    quote.items.forEach(item => {
      totalQuote += item.total_price
      if (item.comparisons.length > 0) {
        const bestPrice = Math.min(...item.comparisons.map(c => c.price))
        totalBest += bestPrice * item.quantity
      } else {
        totalBest += item.total_price
      }
    })
    
    return {
      quote: totalQuote,
      best: totalBest,
      savings: totalQuote - totalBest,
      percent: ((totalQuote - totalBest) / totalQuote * 100).toFixed(1)
    }
  }

  const savings = calculateSavings()

  const handleSearchPrices = async () => {
    setSearching(true)
    // Simula ricerca
    await new Promise(r => setTimeout(r, 3000))
    setSearching(false)
  }

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    // Simula generazione
    await new Promise(r => setTimeout(r, 2000))
    setGeneratingReport(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quote.supplier.name}</h1>
            <p className="text-gray-500">{quote.original_filename}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSearchPrices}
            disabled={searching}
          >
            {searching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Cerca Prezzi
          </Button>
          <Button 
            onClick={handleGenerateReport}
            disabled={generatingReport}
          >
            {generatingReport ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Genera Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Totale Preventivo</p>
            <p className="text-2xl font-bold mt-1">€{savings.quote.toLocaleString('it-IT')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Miglior Totale</p>
            <p className="text-2xl font-bold mt-1 text-green-600">€{savings.best.toLocaleString('it-IT')}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-700">Risparmio Potenziale</p>
            <p className="text-2xl font-bold mt-1 text-green-700">€{savings.savings.toLocaleString('it-IT')}</p>
            <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
              <TrendingDown className="h-4 w-4" />
              -{savings.percent}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Accuracy OCR</p>
            <div className="mt-2">
              <Progress value={quote.ocr_confidence * 100} className="h-2" />
              <p className="text-sm font-medium mt-1">{(quote.ocr_confidence * 100).toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Articoli del Preventivo</CardTitle>
          <CardDescription>{quote.items.length} articoli estratti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quote.items.map((item) => {
              const bestPrice = item.comparisons.length > 0 
                ? Math.min(...item.comparisons.map(c => c.price))
                : item.unit_price
              const itemSavings = (item.unit_price - bestPrice) * item.quantity
              
              return (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Item Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.description}</h4>
                          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x €{item.unit_price} = <span className="font-medium">€{item.total_price.toLocaleString('it-IT')}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Comparisons */}
                    <div className="lg:w-96">
                      <p className="text-sm font-medium mb-2">Confronto prezzi:</p>
                      <div className="space-y-2">
                        {item.comparisons.map((comp, i) => (
                          <div 
                            key={i}
                            className={`flex items-center justify-between p-2 rounded text-sm ${
                              comp.price === bestPrice ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comp.source}</span>
                              {comp.price === bestPrice && (
                                <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">
                                  BEST
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={comp.price === bestPrice ? 'font-bold text-green-700' : ''}>
                                €{comp.price}
                              </span>
                              <a href={comp.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                      {itemSavings > 0 && (
                        <p className="text-sm text-green-600 mt-2 font-medium">
                          Risparmio: €{itemSavings.toLocaleString('it-IT')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
