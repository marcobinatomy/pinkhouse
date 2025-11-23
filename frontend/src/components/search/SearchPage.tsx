import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Loader2,
  ExternalLink,
  ScanBarcode,
  Clock,
  TrendingDown,
  Camera,
  GitCompare,
  Mail,
  Building2,
  CheckSquare
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BarcodeScanner from '@/components/scanner/BarcodeScanner'
import { useToast } from '@/hooks/use-toast'

interface SearchResult {
  source: string
  price: number
  url: string
  availability: string
  shipping?: string
  seller?: string
}

interface SearchResponse {
  query: string
  results: SearchResult[]
  best_price: SearchResult | null
  search_time_ms: number
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [barcode, setBarcode] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([])
  const { toast } = useToast()

  // Mock suppliers list
  const suppliers = [
    { id: 1, name: 'Fornitore A Tech', email: 'ordini@fornitorea.it', responseTime: '18h' },
    { id: 2, name: 'Office Plus', email: 'shop@officeplus.it', responseTime: '24h' },
    { id: 3, name: 'Digital Store', email: 'info@digitalstore.it', responseTime: '12h' },
  ]

  const handleScanSuccess = (decodedText: string, format: string) => {
    setBarcode(decodedText)
    setShowScanner(false)
    
    toast({
      title: "✓ Codice rilevato!",
      description: `${format}: ${decodedText}`,
    })

    // Auto-search after scan
    setTimeout(() => {
      handleSearch(decodedText)
    }, 500)
  }

  const toggleSupplier = (supplierId: number) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    )
  }

  const handleSendToSuppliers = async () => {
    const productName = query || barcode
    
    if (!productName) {
      toast({
        title: "⚠️ Nessun prodotto specificato",
        description: "Effettua prima una ricerca",
        variant: "destructive"
      })
      return
    }

    if (selectedSuppliers.length === 0) {
      toast({
        title: "⚠️ Nessun fornitore selezionato",
        description: "Seleziona almeno un fornitore",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "📧 Richieste inviate!",
      description: `Email inviate a ${selectedSuppliers.length} fornitori per "${productName}"`,
    })

    // TODO: Chiamata API per inviare preventivi
    // await fetch('/api/v1/suppliers/quote-requests/batch', {
    //   method: 'POST',
    //   body: JSON.stringify({ product_name: productName, supplier_ids: selectedSuppliers })
    // })
  }

  const handleSearch = async (searchBarcode?: string) => {
    const searchQuery = query || searchBarcode || barcode
    if (!searchQuery) return

    setSearching(true)

    // Simula ricerca - in produzione: chiama API
    await new Promise(r => setTimeout(r, 2000))

    // Mock results
    setResults({
      query: query || barcode,
      search_time_ms: 1847,
      best_price: {
        source: 'Amazon',
        price: 399,
        url: 'https://amazon.it/...',
        availability: 'in_stock',
        shipping: 'Consegna gratuita domani',
        seller: 'Amazon'
      },
      results: [
        { source: 'Amazon', price: 399, url: 'https://amazon.it/...', availability: 'in_stock', shipping: 'Gratuita domani', seller: 'Amazon' },
        { source: 'ePRICE', price: 419, url: 'https://eprice.it/...', availability: 'in_stock', shipping: '€4.99', seller: 'ePRICE' },
        { source: 'Unieuro', price: 449, url: 'https://unieuro.it/...', availability: 'limited', shipping: '€6.99', seller: 'Unieuro' },
        { source: 'MediaWorld', price: 459, url: 'https://mediaworld.it/...', availability: 'in_stock', shipping: 'Gratuita', seller: 'MediaWorld' },
        { source: 'TrovaPrezzi', price: 409, url: 'https://trovaprezzi.it/...', availability: 'in_stock', shipping: 'Variabile', seller: 'Multi-shop' },
      ]
    })

    setSearching(false)
  }

  const sortedResults = results?.results.sort((a, b) => a.price - b.price) || []
  const bestPrice = sortedResults[0]?.price
  const worstPrice = sortedResults[sortedResults.length - 1]?.price
  const savings = worstPrice && bestPrice ? worstPrice - bestPrice : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cerca Prezzi</h1>
        <p className="text-gray-500 mt-1">Confronta prezzi su Amazon, ePRICE, Unieuro e altri</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nome prodotto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="es. Monitor Dell 27 pollici..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Barcode (opzionale)
              </label>
              <div className="relative">
                <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="EAN/UPC..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row items-end">
              <Button 
                onClick={() => handleSearch()} 
                disabled={searching || (!query && !barcode)}
                className="w-full md:w-auto"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Cerca
              </Button>
              <Button
                onClick={() => setShowScanner(true)}
                variant="outline"
                className="w-full md:w-auto gap-2"
              >
                <Camera className="h-4 w-4" />
                Scansiona
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Results */}
      {results && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-sm text-green-700">Prezzo Migliore</p>
                <p className="text-3xl font-bold text-green-700 mt-1">
                  €{bestPrice?.toLocaleString('it-IT')}
                </p>
                <p className="text-sm text-green-600 mt-1">su {sortedResults[0]?.source}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Risparmio vs peggiore</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                  €{savings.toLocaleString('it-IT')}
                  <TrendingDown className="h-6 w-6 text-green-500" />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Tempo ricerca</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                  {(results.search_time_ms / 1000).toFixed(1)}s
                  <Clock className="h-6 w-6 text-gray-400" />
                </p>
                <p className="text-sm text-gray-500 mt-1">{sortedResults.length} risultati</p>
              </CardContent>
            </Card>
          </div>

          {/* Results List */}
          <Card>
            <CardHeader>
              <CardTitle>Risultati per "{results.query}"</CardTitle>
              <CardDescription>Ordinati per prezzo crescente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedResults.map((result, i) => (
                  <div 
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                      result.price === bestPrice ? 'border-green-300 bg-green-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${
                        i === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        #{i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{result.source}</span>
                          {result.price === bestPrice && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                              BEST PRICE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {result.availability === 'in_stock' && '✓ Disponibile'}
                          {result.availability === 'limited' && '⚠ Scorte limitate'}
                          {result.availability === 'out_of_stock' && '✗ Non disponibile'}
                          {result.shipping && ` • Spedizione: ${result.shipping}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${result.price === bestPrice ? 'text-green-600' : ''}`}>
                          €{result.price.toLocaleString('it-IT')}
                        </p>
                        {result.price !== bestPrice && (
                          <p className="text-sm text-gray-500">
                            +€{(result.price - bestPrice).toLocaleString('it-IT')}
                          </p>
                        )}
                      </div>
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Vai
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action - Comparison */}
          <Card className="border-2 border-primary">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Confronta con i tuoi preventivi</h3>
              <p className="text-gray-600 mb-4">
                Vedi il confronto completo tra prezzi web e preventivi fornitori con analisi AI
              </p>
              <Link to="/comparison">
                <Button size="lg" className="gap-2">
                  <GitCompare className="h-5 w-5" />
                  Vista Confronto 3 Colonne
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* NEW: Request Quotes from Suppliers */}
          <Card className="border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-pink-600" />
                Richiedi Preventivi ai Tuoi Fornitori
              </CardTitle>
              <CardDescription>
                Invia automaticamente richiesta preventivo via email ai fornitori selezionati
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Info */}
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-sm text-gray-600">Prodotto:</p>
                <p className="font-semibold text-lg">{query || barcode}</p>
              </div>

              {/* Suppliers Selection */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Seleziona Fornitori:</p>
                <div className="space-y-2">
                  {suppliers.map((supplier) => (
                    <div 
                      key={supplier.id}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedSuppliers.includes(supplier.id)
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleSupplier(supplier.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedSuppliers.includes(supplier.id)
                              ? 'border-pink-600 bg-pink-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedSuppliers.includes(supplier.id) && (
                              <CheckSquare className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{supplier.name}</p>
                            <p className="text-xs text-gray-600">{supplier.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Risposta media</p>
                          <p className="text-sm font-semibold text-pink-600">{supplier.responseTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Button */}
              <Button 
                onClick={handleSendToSuppliers}
                disabled={selectedSuppliers.length === 0}
                className="w-full gap-2 bg-pink-600 hover:bg-pink-700"
                size="lg"
              >
                <Mail className="h-5 w-5" />
                Invia Richiesta a {selectedSuppliers.length} Fornitori
              </Button>

              {/* Info Note */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm">
                <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-blue-700">
                  Le email saranno inviate automaticamente con il template configurato. 
                  Riceverai notifica quando arrivano le risposte.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!results && !searching && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Cerca un prodotto</h3>
            <p className="mt-2 text-gray-500">
              Inserisci il nome del prodotto o il barcode per confrontare i prezzi
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
