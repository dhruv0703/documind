import { motion } from 'framer-motion'
import { FileUp, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { formatFileSize } from '../../lib/utils'
import {
  ACCEPTED_UPLOAD_ATTRIBUTE,
  MAX_UPLOAD_SIZE_BYTES,
  isAcceptedUploadFile,
} from '../../lib/upload'
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function validateFile(file: File) {
    if (!isAcceptedUploadFile(file)) {
      return 'Only PDF files are supported for document indexing.'
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return `Files larger than ${formatFileSize(MAX_UPLOAD_SIZE_BYTES)} are not supported.`
    }

    return null
  }

  async function handleFile(file: File) {
    if (uploading) {
      return
    }

    setSelectedFile(file)
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setMessage(null)
      resetInput()
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)
    setMessage(null)

    try {
      const response = await uploadPdf(file, setProgress)
      setMessage(`${response.fileName} is ready. ${response.chunkCount} passages were prepared for questions.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
    } finally {
      setUploading(false)
      resetInput()
    }
  }

  const uploadStage =
    !uploading ? null : progress < 100 ? 'Uploading file' : 'Preparing passages and indexing document'

  return (
    <motion.section
      whileHover={{ y: -2 }}
      className="rounded-[24px] border border-[var(--card-border)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Document intake</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-slate-950">
            Add a new PDF to your document library
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
        role="button"
        tabIndex={0}
        aria-label="Upload PDF document"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (!uploading) {
              inputRef.current?.click()
            }
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (uploading) {
            return
          }
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (uploading) {
            return
          }
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
          New files are stored, indexed, and prepared for question answering automatically. PDF only, up to {formatFileSize(MAX_UPLOAD_SIZE_BYTES)}.
        </p>
        {selectedFile ? (
          <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-[var(--card-border)] bg-white px-4 py-4 text-left shadow-[0_8px_18px_rgba(15,23,42,0.03)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected file</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Size</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatFileSize(selectedFile.size)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Type</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedFile.type || 'application/pdf'}</p>
              </div>
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={() => inputRef.current?.click()} loading={uploading} disabled={uploading}>
            Choose file
          </Button>
          <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
            Browse local files
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_ATTRIBUTE}
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
            <span>{uploadStage}</span>
            <span>{progress}%</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {progress < 100
              ? 'Uploading the file to your workspace.'
              : 'Upload complete. Preparing searchable passages now.'}
          </p>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[linear-gradient(90deg,#fdba74_0%,#f97316_100%)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 text-sm text-emerald-600" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </motion.section>
  )
}
