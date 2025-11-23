import { useState } from 'react'
import { 
  Search, 
  Loader2,
  ExternalLink,
  ScanBarcode,
  Clock,
  TrendingDown
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

  const handleSearch = async () => {
    if (!query && !barcode) return

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
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
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
            </div>
          </div>
        </CardContent>
      </Card>

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
