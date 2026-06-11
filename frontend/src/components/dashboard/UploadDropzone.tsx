import { motion } from 'framer-motion'
import { FileUp, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { useWorkspace } from '../../workspace/WorkspaceContext'
import { Button } from '../ui/Button'

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { uploadPdf } = useWorkspace()
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.')
      setMessage(null)
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)
    setMessage(null)

    try {
      const response = await uploadPdf(file, setProgress)
      setMessage(`${response.fileName} uploaded successfully with status ${response.status}.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.section
      whileHover={{ y: -2 }}
      className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Upload panel</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-slate-950">
            Add a new PDF to the knowledge base
          </h3>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-orange-600">
          <UploadCloud className="h-5 w-5" />
        </div>
      </div>

      <div
        className={`mt-6 rounded-[28px] border-2 border-dashed p-8 text-center transition ${
          dragging
            ? 'border-orange-300 bg-orange-50/80'
            : 'border-[var(--card-border)] bg-stone-50'
        }`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          const file = event.dataTransfer.files[0]
          if (file) {
            void handleFile(file)
          }
        }}
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[linear-gradient(135deg,#fb923c_0%,#f97316_100%)] text-white shadow-[0_16px_30px_rgba(249,115,22,0.24)]">
          <FileUp className="h-7 w-7" />
        </div>
        <h4 className="mt-5 text-lg font-semibold text-slate-900">Drag and drop your PDF here</h4>
        <p className="mt-2 text-sm text-slate-500">
          Keep your uploads separate from the UI. The backend stores and indexes them independently.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={() => inputRef.current?.click()} loading={uploading}>
            Choose file
          </Button>
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            Browse local files
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void handleFile(file)
            }
          }}
        />
      </div>

      {uploading ? (
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Uploading and indexing</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[linear-gradient(90deg,#fdba74_0%,#f97316_100%)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </motion.section>
  )
}
