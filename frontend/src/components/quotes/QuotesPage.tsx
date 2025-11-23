import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileText, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

interface Quote {
  id: number
  original_filename: string
  supplier?: string
  total_amount?: number
  status: string
  created_at: string
  ocr_confidence?: number
}

const statusConfig = {
  pending: { label: 'In attesa', color: 'bg-gray-100 text-gray-800', icon: FileText },
  processing: { label: 'Elaborazione', color: 'bg-yellow-100 text-yellow-800', icon: Loader2 },
  analyzed: { label: 'Analizzato', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  compared: { label: 'Confrontato', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  completed: { label: 'Completato', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  error: { label: 'Errore', color: 'bg-red-100 text-red-800', icon: AlertCircle },
}

// Mock data - in produzione verrà da API
const mockQuotes: Quote[] = [
  { id: 1, original_filename: 'preventivo_techsupply.pdf', supplier: 'TechSupply Srl', total_amount: 12500, status: 'completed', created_at: '2025-01-15T10:30:00Z', ocr_confidence: 0.94 },
  { id: 2, original_filename: 'offerta_office.pdf', supplier: 'Office Plus', total_amount: 3200, status: 'analyzed', created_at: '2025-01-15T08:15:00Z', ocr_confidence: 0.88 },
  { id: 3, original_filename: 'quotazione_industrial.pdf', supplier: 'Industrial Parts', total_amount: 28900, status: 'processing', created_at: '2025-01-14T16:45:00Z' },
]

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    for (const file of acceptedFiles) {
      // Simula upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(r => setTimeout(r, 100))
      }

      // In produzione: chiama API
      // const formData = new FormData()
      // formData.append('file', file)
      // await fetch('/api/v1/quotes/upload', { method: 'POST', body: formData })

      const newQuote: Quote = {
        id: quotes.length + 1,
        original_filename: file.name,
        status: 'processing',
        created_at: new Date().toISOString(),
      }

      setQuotes(prev => [newQuote, ...prev])

      toast({
        title: 'Upload completato',
        description: `${file.name} caricato con successo. Elaborazione OCR in corso...`,
      })
    }

    setUploading(false)
    setUploadProgress(0)
  }, [quotes, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const filteredQuotes = quotes.filter(q => 
    q.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Preventivi</h1>
        <p className="text-gray-500 mt-1">Carica e gestisci i tuoi preventivi</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto text-pink-500 animate-spin" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Caricamento in corso...</p>
                  <Progress value={uploadProgress} className="w-64 mx-auto" />
                  <p className="text-xs text-gray-500">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-lg font-medium">
                  {isDragActive ? 'Rilascia qui i file' : 'Trascina qui i preventivi'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  oppure clicca per selezionare
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PDF, PNG, JPG fino a 10MB
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Lista Preventivi</CardTitle>
              <CardDescription>{quotes.length} preventivi caricati</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca preventivi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-4">Nessun preventivo trovato</p>
              </div>
            ) : (
              filteredQuotes.map((quote) => {
                const status = statusConfig[quote.status as keyof typeof statusConfig] || statusConfig.pending
                const StatusIcon = status.icon
                
                return (
                  <Link
                    key={quote.id}
                    to={`/quotes/${quote.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{quote.supplier || quote.original_filename}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(quote.created_at).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {quote.total_amount && (
                        <span className="font-semibold">
                          €{quote.total_amount.toLocaleString('it-IT')}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                        <StatusIcon className={`h-3 w-3 ${quote.status === 'processing' ? 'animate-spin' : ''}`} />
                        {status.label}
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
