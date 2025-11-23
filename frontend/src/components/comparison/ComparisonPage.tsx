import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download,
  Sparkles,
  Package,
  Truck,
  CreditCard,
  Star,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { downloadPDFReport } from '@/lib/pdfGenerator'
import { useToast } from '@/hooks/use-toast'

interface WebPrice {
  source: string
  price: number
  shipping: number
  availability: string
  delivery_days: number
  rating: number
  reviews: number
  seller: string
  url: string
}

interface QuotePrice {
  supplier: string
  price: number
  quote_number: string
  valid_until: string
  payment_terms: string
  delivery_days: number
  min_quantity?: number
}

interface AIAnalysis {
  best_option: 'web' | 'quote' | 'mix'
  savings: number
  savings_percent: number
  confidence: number
  warnings: string[]
  recommendations: string[]
  quality_score: number
}

interface ComparisonItem {
  id: number
  name: string
  sku: string
  quantity: number
  image?: string
  web_prices: WebPrice[]
  quote_prices: QuotePrice[]
  ai_analysis: AIAnalysis
}

// Mock data
const mockComparison: ComparisonItem = {
  id: 1,
  name: 'Mouse Wireless Logitech MX Master 3',
  sku: 'LOG-MXM3-BLK',
  quantity: 5,
  image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop',
  web_prices: [
    {
      source: 'Amazon',
      price: 89.99,
      shipping: 0,
      availability: 'in_stock',
      delivery_days: 1,
      rating: 4.7,
      reviews: 2459,
      seller: 'Amazon',
      url: 'https://amazon.it/...'
    },
    {
      source: 'ePRICE',
      price: 94.90,
      shipping: 4.99,
      availability: 'in_stock',
      delivery_days: 3,
      rating: 4.5,
      reviews: 318,
      seller: 'ePRICE Store',
      url: 'https://eprice.it/...'
    },
    {
      source: 'Unieuro',
      price: 99.99,
      shipping: 0,
      availability: 'limited',
      delivery_days: 5,
      rating: 4.2,
      reviews: 124,
      seller: 'Unieuro',
      url: 'https://unieuro.it/...'
    }
  ],
  quote_prices: [
    {
      supplier: 'TechSupply Srl',
      price: 92.50,
      quote_number: 'TS-2025-0042',
      valid_until: '2025-02-15',
      payment_terms: '30gg d.f.',
      delivery_days: 7
    },
    {
      supplier: 'Office Plus',
      price: 88.50,
      quote_number: 'OP-2025-0158',
      valid_until: '2025-02-28',
      payment_terms: '60gg d.f.',
      delivery_days: 10,
      min_quantity: 5
    }
  ],
  ai_analysis: {
    best_option: 'web',
    savings: 104.55,
    savings_percent: 18.8,
    confidence: 95,
    warnings: ['Fornitore Office Plus: primo ordine, nessuno storico'],
    recommendations: [
      'Amazon offre il miglior rapporto prezzo/servizio',
      'Consegna 9 giorni prima rispetto ai preventivi',
      'Prezzo attualmente al minimo storico mensile',
      'Reso gratuito entro 30 giorni'
    ],
    quality_score: 92
  }
}

export default function ComparisonPage() {
  const [item] = useState<ComparisonItem>(mockComparison)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const { toast } = useToast()

  const bestWeb = item.web_prices.reduce((best, current) => 
    (current.price + current.shipping) < (best.price + best.shipping) ? current : best
  )
  
  const bestQuote = item.quote_prices.reduce((best, current) => 
    current.price < best.price ? current : best
  )

  const totalWebPrice = (bestWeb.price + bestWeb.shipping) * item.quantity
  const totalQuotePrice = bestQuote.price * item.quantity

  const handleGeneratePDF = () => {
    setGeneratingPDF(true)
    
    try {
      downloadPDFReport({
        product_name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        web_best_price: bestWeb.price,
        quote_best_price: bestQuote.price,
        savings: item.ai_analysis.savings,
        savings_percent: item.ai_analysis.savings_percent,
        web_delivery_days: bestWeb.delivery_days,
        quote_delivery_days: bestQuote.delivery_days,
        confidence: item.ai_analysis.confidence,
        recommendations: item.ai_analysis.recommendations,
        warnings: item.ai_analysis.warnings,
        analysis: {
          quality_score: item.ai_analysis.quality_score,
          reliability_score: 88,
          delivery_score: 95
        }
      })
      
      toast({
        title: "✓ Report generato!",
        description: "Il PDF è stato scaricato con successo",
      })
    } catch (error) {
      toast({
        title: "✗ Errore",
        description: "Impossibile generare il report PDF",
        variant: "destructive"
      })
    } finally {
      setGeneratingPDF(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/search">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Confronto Prezzi</h1>
            <p className="text-gray-500 mt-1">Analisi completa e raccomandazione AI</p>
          </div>
        </div>
        <Button className="gap-2" onClick={handleGeneratePDF} disabled={generatingPDF}>
          {generatingPDF ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generazione...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Genera Report PDF
            </>
          )}
        </Button>
      </div>

      {/* Product Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {item.image && (
              <img 
                src={item.image} 
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg border"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
              <p className="text-gray-500 mt-1">SKU: {item.sku}</p>
              <div className="mt-2">
                <Badge variant="outline">Quantità: {item.quantity}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Risparmio potenziale</p>
              <p className="text-3xl font-bold text-green-600">
                €{item.ai_analysis.savings.toFixed(2)}
              </p>
              <p className="text-sm text-green-600">{item.ai_analysis.savings_percent}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3 Columns Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: WEB PRICES */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Package className="h-5 w-5" />
              🌐 Prezzi Web
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.web_prices.map((web, idx) => {
              const total = web.price + web.shipping
              const isBest = web.source === bestWeb.source
              
              return (
                <Card key={idx} className={isBest ? 'border-2 border-blue-500 shadow-lg' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {web.source}
                          {isBest && <Badge className="bg-blue-500">Migliore</Badge>}
                        </h3>
                        <p className="text-xs text-gray-500">{web.seller}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">€{web.price}</p>
                        <p className="text-xs text-gray-500">cad.</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Spedizione:</span>
                        <span className="font-medium">
                          {web.shipping === 0 ? 'Gratuita' : `€${web.shipping}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Totale:</span>
                        <span className="font-bold">€{(total * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Consegna:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {web.delivery_days === 1 ? 'Domani' : `${web.delivery_days} giorni`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {web.rating} ({web.reviews})
                        </span>
                      </div>
                      <div className="pt-2">
                        <Badge 
                          variant={web.availability === 'in_stock' ? 'default' : 'secondary'}
                          className="w-full justify-center"
                        >
                          {web.availability === 'in_stock' ? '✓ Disponibile' : '⚠️ Scorte limitate'}
                        </Badge>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3 gap-2"
                      onClick={() => window.open(web.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Vai al sito
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>

        {/* Column 2: QUOTES */}
        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Package className="h-5 w-5" />
              📋 Preventivi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.quote_prices.map((quote, idx) => {
              const isBest = quote.supplier === bestQuote.supplier
              
              return (
                <Card key={idx} className={isBest ? 'border-2 border-purple-500 shadow-lg' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {quote.supplier}
                          {isBest && <Badge className="bg-purple-500">Migliore</Badge>}
                        </h3>
                        <p className="text-xs text-gray-500">{quote.quote_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">€{quote.price}</p>
                        <p className="text-xs text-gray-500">cad.</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Totale:</span>
                        <span className="font-bold">€{(quote.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Consegna:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {quote.delivery_days} giorni
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Pagamento:</span>
                        <span className="font-medium flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {quote.payment_terms}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Validità:</span>
                        <span className="font-medium">
                          {new Date(quote.valid_until).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      {quote.min_quantity && (
                        <div className="pt-2">
                          <Badge variant="secondary" className="w-full justify-center">
                            Min. {quote.min_quantity} pz
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>

        {/* Column 3: AI ANALYSIS */}
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Sparkles className="h-5 w-5" />
              📊 Analisi AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Best Option */}
            <Card className="border-2 border-green-500 bg-green-100">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-green-700 font-medium mb-2">🏆 RACCOMANDAZIONE</p>
                  <p className="text-2xl font-bold text-green-900">
                    {item.ai_analysis.best_option === 'web' ? 'Acquista da Web' : 
                     item.ai_analysis.best_option === 'quote' ? 'Preventivo' : 'Mix'}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Confidence: {item.ai_analysis.confidence}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Savings */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">💰 Risparmio</span>
                  <TrendingDown className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  €{item.ai_analysis.savings.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {item.ai_analysis.savings_percent}% di sconto
                </p>
              </CardContent>
            </Card>

            {/* Quality Score */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">⚡ Score Convenienza</span>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {item.ai_analysis.quality_score}
                  </p>
                  <p className="text-gray-500">/100</p>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                    style={{ width: `${item.ai_analysis.quality_score}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {item.ai_analysis.warnings.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 mb-1">⚠️ Attenzione</p>
                      {item.ai_analysis.warnings.map((warning, idx) => (
                        <p key={idx} className="text-sm text-yellow-800">• {warning}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardContent className="p-4">
                <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  💡 Raccomandazioni
                </p>
                <div className="space-y-2">
                  {item.ai_analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Comparison */}
            <Card>
              <CardContent className="p-4">
                <p className="font-medium text-gray-900 mb-3">📈 Confronto Prezzi</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Web (migliore):</span>
                    <span className="font-bold text-blue-600">€{totalWebPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preventivo (migliore):</span>
                    <span className="font-bold text-purple-600">€{totalQuotePrice.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Differenza:</span>
                      <span className={`font-bold ${totalWebPrice < totalQuotePrice ? 'text-green-600' : 'text-red-600'}`}>
                        {totalWebPrice < totalQuotePrice ? (
                          <span className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4" />
                            €{(totalQuotePrice - totalWebPrice).toFixed(2)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            €{(totalWebPrice - totalQuotePrice).toFixed(2)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
