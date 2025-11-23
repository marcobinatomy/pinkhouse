import { useState } from 'react'
import { 
  BarChart3, 
  FileText,
  Download,
  Eye,
  TrendingDown,
  Calendar,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Report {
  id: number
  title: string
  quote_id: number
  supplier: string
  created_at: string
  total_savings: number
  recommendations_count: number
}

const mockReports: Report[] = [
  {
    id: 1,
    title: 'Analisi Preventivo TechSupply',
    quote_id: 1,
    supplier: 'TechSupply Srl',
    created_at: '2025-01-15T11:00:00Z',
    total_savings: 1250,
    recommendations_count: 5
  },
  {
    id: 2,
    title: 'Analisi Preventivo Office Plus',
    quote_id: 2,
    supplier: 'Office Plus',
    created_at: '2025-01-15T09:30:00Z',
    total_savings: 420,
    recommendations_count: 3
  },
]

export default function ReportsPage() {
  const [reports] = useState<Report[]>(mockReports)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const totalSavings = reports.reduce((acc, r) => acc + r.total_savings, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report AI</h1>
          <p className="text-gray-500 mt-1">Analisi e raccomandazioni automatiche</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Report Generati</p>
                <p className="text-xl font-bold">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700">Risparmio Identificato</p>
                <p className="text-xl font-bold text-green-700">€{totalSavings.toLocaleString('it-IT')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Raccomandazioni</p>
                <p className="text-xl font-bold">
                  {reports.reduce((acc, r) => acc + r.recommendations_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Report Recenti</CardTitle>
          <CardDescription>Clicca su un report per vedere i dettagli</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedReport?.id === report.id 
                    ? 'border-pink-300 bg-pink-50' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">{report.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {report.supplier}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(report.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      €{report.total_savings.toLocaleString('it-IT')}
                    </p>
                    <p className="text-xs text-gray-500">risparmio</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-4">Nessun report generato</p>
                <p className="text-sm">Carica un preventivo e genera il primo report</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedReport.title}</CardTitle>
                <CardDescription>Generato il {new Date(selectedReport.created_at).toLocaleString('it-IT')}</CardDescription>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Scarica PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>📊 Riepilogo Esecutivo</h3>
              <p>
                L'analisi del preventivo di <strong>{selectedReport.supplier}</strong> ha identificato 
                opportunità di risparmio per <strong className="text-green-600">€{selectedReport.total_savings.toLocaleString('it-IT')}</strong>. 
                Sono state generate {selectedReport.recommendations_count} raccomandazioni prioritarie.
              </p>

              <h3>💡 Raccomandazioni</h3>
              <div className="space-y-3 not-prose">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded font-medium">ALTA</span>
                    <span className="font-medium">Negoziare prezzo monitor Dell</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Il prezzo quotato di €450/unità è superiore del 12% rispetto al miglior prezzo di mercato (€399 su Amazon).
                    Potenziale risparmio: €510 su 10 unità.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-medium">MEDIA</span>
                    <span className="font-medium">Considerare bundle tastiera+mouse</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Acquistando il bundle Logitech MX Keys + MX Master 3S si risparmiano €15/set rispetto agli acquisti separati.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded font-medium">BASSA</span>
                    <span className="font-medium">Verificare disponibilità scorte</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Alcuni prodotti mostrano scorte limitate su Unieuro. Confermare disponibilità prima dell'ordine.
                  </p>
                </div>
              </div>

              <h3>⚠️ Rischi Identificati</h3>
              <ul>
                <li>Tempi di consegna non specificati nel preventivo</li>
                <li>Condizioni di garanzia da verificare</li>
              </ul>

              <h3>✅ Conclusione</h3>
              <p>
                Si consiglia di procedere con la negoziazione basandosi sui prezzi di mercato identificati.
                Il risparmio potenziale giustifica una rinegoziazione con il fornitore.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
