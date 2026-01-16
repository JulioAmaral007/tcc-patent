import Tesseract from 'tesseract.js'

// PDF.js will be imported dynamically only when needed (client-side only)
let pdfjsLib: typeof import('pdfjs-dist') | null = null

async function getPdfjsLib() {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js só pode ser usado no navegador')
  }

  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  }

  return pdfjsLib
}

export interface OCRProgress {
  status: string
  progress: number
}

export interface OCRResult {
  text: string
  confidence: number
}

export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void,
): Promise<OCRResult> {
  const imageUrl = URL.createObjectURL(imageFile)

  try {
    const result = await Tesseract.recognize(imageUrl, 'por+eng', {
      logger: (m) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: m.progress || 0,
          })
        }
      },
    })

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    }
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

export async function extractTextFromPDF(
  pdfFile: File,
  onProgress?: (progress: OCRProgress) => void,
): Promise<string> {
  // Import PDF.js dynamically (client-side only)
  const pdfjs = await getPdfjsLib()

  const arrayBuffer = await pdfFile.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const totalPages = pdf.numPages
  let extractedText = ''

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (onProgress) {
      onProgress({
        status: `Processando página ${pageNum} de ${totalPages}`,
        progress: pageNum / totalPages,
      })
    }

    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = (textContent.items as Array<{ str: string }>).map((item) => item.str).join(' ')

    extractedText += pageText + '\n\n'
  }

  return extractedText.trim()
}

export async function processFile(
  file: File,
  onProgress?: (progress: OCRProgress) => void,
): Promise<string> {
  const fileType = file.type

  if (fileType === 'application/pdf') {
    return extractTextFromPDF(file, onProgress)
  } else if (fileType.startsWith('image/')) {
    const result = await extractTextFromImage(file, onProgress)
    return result.text
  } else {
    throw new Error(`Tipo de arquivo não suportado: ${fileType}`)
  }
}

export function isValidFileType(file: File): boolean {
  const validTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf',
  ]
  return validTypes.includes(file.type)
}

export function getFileTypeLabel(file: File): string {
  if (file.type === 'application/pdf') return 'PDF'
  if (file.type.startsWith('image/')) return 'Imagem'
  return 'Arquivo'
}
