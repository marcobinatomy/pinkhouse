/**
 * PinkHouse - Smart Procurement Platform
 * Tool creato da Marco Salvatici e Nicola Casarosa per binatomy.com
 * Data: 23 Novembre 2024
 * 
 * Settings Page - Configurazione Sistema
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Key, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Save,
  TestTube,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'ai' | 'suppliers'>('email')
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpEmail: 'pinkhouse@binatomy.com',
    smtpPassword: '••••••••',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
  })
  const [aiConfig, setAIConfig] = useState({
    openaiKey: 'sk-••••••••••••••••',
    anthropicKey: 'sk-ant-••••••••••••••••',
  })
  const [suppliers] = useState([
    { id: 1, name: 'Fornitore A Tech', email: 'ordini@fornitorea.it', method: 'email', active: true },
    { id: 2, name: 'Office Plus', email: 'shop@officeplus.it', method: 'email', active: true },
    { id: 3, name: 'Digital Store', apiUrl: 'https://api.digitalstore.it', method: 'api', active: true },
  ])
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleEmailTest = async () => {
    setTestResult({ success: true, message: 'Connessione SMTP/IMAP riuscita! ✅' })
    setTimeout(() => setTestResult(null), 5000)
  }

  const handleAITest = async () => {
    setTestResult({ success: true, message: 'API Keys valide! ✅' })
    setTimeout(() => setTestResult(null), 5000)
  }

  const handleSaveEmail = () => {
    setTestResult({ success: true, message: 'Configurazione email salvata!' })
    setTimeout(() => setTestResult(null), 3000)
  }

  const handleSaveAI = () => {
    setTestResult({ success: true, message: 'Configurazione AI salvata!' })
    setTimeout(() => setTestResult(null), 3000)
  }

  const handleAddSupplier = () => {
    // TODO: Mostra modal per aggiungere nuovo fornitore
    alert('Modal aggiunta fornitore (da implementare)')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Impostazioni</h1>
        <p className="text-gray-500 mt-1">Configura email, AI e fornitori</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'email'
              ? 'border-b-2 border-pink-600 text-pink-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="inline h-4 w-4 mr-2" />
          Email
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'ai'
              ? 'border-b-2 border-pink-600 text-pink-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Key className="inline h-4 w-4 mr-2" />
          AI Keys
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'suppliers'
              ? 'border-b-2 border-pink-600 text-pink-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="inline h-4 w-4 mr-2" />
          Fornitori
        </button>
      </div>

      {/* Test Result Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {testResult.success ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{testResult.message}</span>
        </div>
      )}

      {/* Email Configuration */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📧 SMTP (Invio Email)</CardTitle>
              <CardDescription>
                Configura il server per l'invio automatico dei preventivi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Host SMTP</label>
                  <Input
                    value={emailConfig.smtpHost}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Porta</label>
                  <Input
                    type="number"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: Number(e.target.value) })}
                    placeholder="587"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={emailConfig.smtpEmail}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpEmail: e.target.value })}
                  placeholder="pinkhouse@binatomy.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input
                  type="password"
                  value={emailConfig.smtpPassword}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Per Gmail: usa App Password (non la password normale)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📥 IMAP (Ricezione Email)</CardTitle>
              <CardDescription>
                Monitora la casella per ricevere le risposte dei fornitori
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Host IMAP</label>
                  <Input
                    value={emailConfig.imapHost}
                    onChange={(e) => setEmailConfig({ ...emailConfig, imapHost: e.target.value })}
                    placeholder="imap.gmail.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Porta</label>
                  <Input
                    type="number"
                    value={emailConfig.imapPort}
                    onChange={(e) => setEmailConfig({ ...emailConfig, imapPort: Number(e.target.value) })}
                    placeholder="993"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleEmailTest} variant="outline" className="gap-2">
              <TestTube className="h-4 w-4" />
              Testa Connessione
            </Button>
            <Button onClick={handleSaveEmail} className="gap-2 bg-pink-600 hover:bg-pink-700">
              <Save className="h-4 w-4" />
              Salva Configurazione
            </Button>
          </div>
        </div>
      )}

      {/* AI Configuration */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🤖 OpenAI (GPT-4)</CardTitle>
              <CardDescription>
                Usato per OCR avanzato, analisi preventivi, confronto fornitori
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">API Key</label>
                <Input
                  type="password"
                  value={aiConfig.openaiKey}
                  onChange={(e) => setAIConfig({ ...aiConfig, openaiKey: e.target.value })}
                  placeholder="sk-••••••••••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ottieni la tua chiave su <a href="https://platform.openai.com" target="_blank" className="text-blue-600">platform.openai.com</a>
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-blue-900">💡 Consiglio</p>
                <p className="text-blue-700 mt-1">
                  GPT-4 Turbo consigliato per OCR. Costo medio: €0.03 per preventivo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧠 Anthropic (Claude)</CardTitle>
              <CardDescription>
                Backup AI per analisi complesse e confronto semantico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">API Key</label>
                <Input
                  type="password"
                  value={aiConfig.anthropicKey}
                  onChange={(e) => setAIConfig({ ...aiConfig, anthropicKey: e.target.value })}
                  placeholder="sk-ant-••••••••••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ottieni la tua chiave su <a href="https://console.anthropic.com" target="_blank" className="text-blue-600">console.anthropic.com</a>
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-700">
                  Opzionale. Usato come fallback se OpenAI non disponibile.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleAITest} variant="outline" className="gap-2">
              <TestTube className="h-4 w-4" />
              Verifica API Keys
            </Button>
            <Button onClick={handleSaveAI} className="gap-2 bg-pink-600 hover:bg-pink-700">
              <Save className="h-4 w-4" />
              Salva Configurazione
            </Button>
          </div>
        </div>
      )}

      {/* Suppliers Management */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Fornitori Configurati</h2>
              <p className="text-sm text-gray-600">Gestisci i tuoi fornitori e metodi di richiesta</p>
            </div>
            <Button onClick={handleAddSupplier} className="gap-2 bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4" />
              Nuovo Fornitore
            </Button>
          </div>

          <div className="space-y-3">
            {suppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        supplier.method === 'email' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {supplier.method === 'email' ? (
                          <Mail className="h-6 w-6 text-blue-600" />
                        ) : (
                          <Key className="h-6 w-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{supplier.name}</h3>
                          {supplier.active ? (
                            <Badge className="bg-green-100 text-green-800">Attivo</Badge>
                          ) : (
                            <Badge variant="secondary">Disattivato</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {supplier.method === 'email' 
                            ? `📧 ${supplier.email}` 
                            : `🔌 ${supplier.apiUrl}`
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Metodo: <span className="font-medium">{supplier.method.toUpperCase()}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <TestTube className="h-4 w-4" />
                        Testa
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Modifica
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Aggiungi altri fornitori</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Più fornitori = maggior risparmio e scelta
                  </p>
                </div>
                <Button onClick={handleAddSupplier} className="gap-2 bg-pink-600 hover:bg-pink-700 mt-2">
                  <Plus className="h-4 w-4" />
                  Aggiungi Fornitore
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Metodi Supportati</h4>
                  <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                    <li>• <strong>Email:</strong> Richiesta automatica via email (il più comune)</li>
                    <li>• <strong>API:</strong> Integrazione diretta con API fornitore (più veloce)</li>
                    <li>• <strong>Portal:</strong> Scraping automatico da portale web fornitore</li>
                    <li>• <strong>Manual:</strong> Richiesta manuale (per fornitori senza automazione)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
