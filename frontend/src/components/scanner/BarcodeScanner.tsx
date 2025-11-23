import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string, format: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [torchOn, setTorchOn] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const qrCodeRegionId = 'qr-reader'

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeRegionId)
    scannerRef.current = html5QrCode

    startScanning()

    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    if (!scannerRef.current) return

    setScanning(true)
    setScanStatus('idle')

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText, decodedResult) => {
          // Success callback
          setLastScanned(decodedText)
          setScanStatus('success')
          
          // Vibration feedback if supported
          if (navigator.vibrate) {
            navigator.vibrate(200)
          }

          // Notify parent
          onScanSuccess(decodedText, decodedResult.result.format?.formatName || 'UNKNOWN')
        },
        (errorMessage: string) => {
          // Error callback - silent, just scanning
          console.log('Scan error:', errorMessage)
        }
      )
    } catch (err) {
      console.error('Error starting scanner:', err)
      setScanStatus('error')
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
      setScanning(false)
    }
  }

  const toggleTorch = async () => {
    if (!scannerRef.current) return

    try {
      const track = scannerRef.current.getRunningTrackCameraCapabilities()
      // @ts-ignore - torch property not in standard types
      if (track.torch) {
        // @ts-ignore
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }]
        })
        setTorchOn(!torchOn)
      }
    } catch (err) {
      console.error('Torch not supported:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-white font-semibold">Scanner Barcode</h2>
              <p className="text-white/70 text-sm">Inquadra il codice a barre o QR code</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="flex items-center justify-center h-full p-4">
        <div className="relative max-w-md w-full">
          {/* Scanner Container */}
          <div id={qrCodeRegionId} className="rounded-lg overflow-hidden border-4 border-white/30 shadow-2xl" />

          {/* Scanning Overlay */}
          {scanning && scanStatus === 'idle' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                
                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="h-1 w-full bg-primary/60 animate-scan-line shadow-[0_0_10px_rgba(255,20,147,0.5)]" />
                </div>
              </div>
            </div>
          )}

          {/* Success Feedback */}
          {scanStatus === 'success' && lastScanned && (
            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center rounded-lg border-4 border-green-500">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2 animate-bounce" />
                <p className="text-white font-semibold text-lg">Codice rilevato!</p>
                <p className="text-white/80 text-sm font-mono mt-1 break-all px-4">{lastScanned}</p>
              </div>
            </div>
          )}

          {/* Error Feedback */}
          {scanStatus === 'error' && (
            <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center rounded-lg border-4 border-red-500">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-2" />
                <p className="text-white font-semibold text-lg">Errore scanner</p>
                <p className="text-white/80 text-sm mt-1">Verifica i permessi camera</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            {/* Torch Button */}
            <Button
              onClick={toggleTorch}
              variant={torchOn ? "default" : "outline"}
              size="lg"
              className={torchOn ? "bg-yellow-500 hover:bg-yellow-600" : "border-white/30 text-white hover:bg-white/20"}
            >
              <Zap className="h-5 w-5 mr-2" />
              {torchOn ? 'Torcia ON' : 'Torcia'}
            </Button>

            {/* Info Card */}
            <Card className="bg-black/50 border-white/20 backdrop-blur-sm px-4 py-2">
              <p className="text-white/70 text-sm text-center">
                Supporta: EAN-13, UPC, QR Code, Code 128
              </p>
            </Card>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="text-white/60 text-sm">
              📱 Mantieni il dispositivo stabile • 💡 Assicurati di avere buona illuminazione
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
