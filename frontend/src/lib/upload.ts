export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024
export const ACCEPTED_UPLOAD_MIME_TYPES = ['application/pdf']
export const ACCEPTED_UPLOAD_EXTENSIONS = ['.pdf']
export const ACCEPTED_UPLOAD_ATTRIBUTE = '.pdf,application/pdf'

export function isAcceptedUploadFile(file: File) {
  const fileName = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()

  return (
    ACCEPTED_UPLOAD_MIME_TYPES.includes(mimeType) ||
    ACCEPTED_UPLOAD_EXTENSIONS.some((extension) => fileName.endsWith(extension))
  )
}
