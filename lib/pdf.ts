import { jsPDF } from 'jspdf'

interface ExportPDFOptions {
  result: string
  title?: string
  filename?: string
}

export async function exportToPDF({
  result,
  title = 'Análise de Patente',
  filename = 'analise-patente',
}: ExportPDFOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  const lineHeight = 6
  let currentY = margin

  // Cores
  const primaryColor: [number, number, number] = [59, 130, 246] // Azul
  const textColor: [number, number, number] = [30, 41, 59] // Cinza escuro
  const mutedColor: [number, number, number] = [100, 116, 139] // Cinza

  // Header com fundo colorido
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Título
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, 20, { align: 'center' })

  // Subtítulo com data
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Gerado em ${dateStr}`, pageWidth / 2, 28, { align: 'center' })

  currentY = 50

  // Linha decorativa
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.5)
  doc.line(margin, currentY, pageWidth - margin, currentY)

  currentY += 10

  // Conteúdo
  doc.setTextColor(...textColor)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  // Quebrar o texto em linhas
  const lines = result.split('\n')

  for (const line of lines) {
    // Verificar se precisa de nova página
    if (currentY > pageHeight - margin - 15) {
      doc.addPage()
      currentY = margin

      // Header simplificado nas páginas seguintes
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, pageWidth, 15, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text(title, pageWidth / 2, 10, { align: 'center' })

      currentY = 25
      doc.setTextColor(...textColor)
      doc.setFontSize(11)
    }

    // Detectar linhas especiais (títulos, separadores)
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('═') || trimmedLine.startsWith('─')) {
      // Linha separadora
      doc.setDrawColor(...mutedColor)
      doc.setLineWidth(0.3)
      doc.line(margin, currentY, pageWidth - margin, currentY)
      currentY += lineHeight
    } else if (
      trimmedLine.startsWith('📋') ||
      trimmedLine.startsWith('📝') ||
      trimmedLine.startsWith('📊') ||
      trimmedLine.startsWith('⚠️')
    ) {
      // Título de seção
      currentY += 3
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(...primaryColor)

      // Remover emoji para PDF (não suporta bem)
      const cleanText = trimmedLine.replace(/[\p{Emoji}]/gu, '').trim()
      doc.text(cleanText, margin, currentY)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(...textColor)
      currentY += lineHeight + 2
    } else if (trimmedLine === '') {
      // Linha vazia
      currentY += lineHeight / 2
    } else {
      // Texto normal - quebrar se muito longo
      const wrappedLines = doc.splitTextToSize(line, contentWidth)

      for (const wrappedLine of wrappedLines) {
        if (currentY > pageHeight - margin - 15) {
          doc.addPage()
          currentY = margin

          doc.setFillColor(...primaryColor)
          doc.rect(0, 0, pageWidth, 15, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(10)
          doc.text(title, pageWidth / 2, 10, { align: 'center' })

          currentY = 25
          doc.setTextColor(...textColor)
          doc.setFontSize(11)
        }

        doc.text(wrappedLine, margin, currentY)
        currentY += lineHeight
      }
    }
  }

  // Footer em todas as páginas
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Linha do footer
    doc.setDrawColor(...mutedColor)
    doc.setLineWidth(0.3)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

    // Número da página
    doc.setFontSize(9)
    doc.setTextColor(...mutedColor)
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 8, {
      align: 'center',
    })

    // Nome do sistema
    doc.text('Sistema de Análise de Patentes', margin, pageHeight - 8)
  }

  // Gerar timestamp para nome único
  const timestamp = new Date().toISOString().split('T')[0]
  const finalFilename = `${filename}-${timestamp}.pdf`

  // Download do arquivo
  doc.save(finalFilename)
}

