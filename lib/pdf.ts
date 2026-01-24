import { jsPDF } from 'jspdf'

interface ExportPDFOptions {
  result: string
  title?: string
  filename?: string
}

export async function exportToPDF({
  result,
  title = 'Patent Analysis',
  filename = 'patent-analysis',
}: ExportPDFOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 25 // Margem levemente maior para um ar mais editorial
  const contentWidth = pageWidth - margin * 2
  const lineHeight = 6.5
  let currentY = margin

  // Design Tokens (Minimalist & Premium)
  const colors = {
    accent: [15, 23, 42] as [number, number, number],    // Slate 900
    text: [51, 65, 85] as [number, number, number],      // Slate 700
    muted: [148, 163, 184] as [number, number, number], // Slate 400
    light: [241, 245, 249] as [number, number, number], // Slate 100
  }

  // --- Função para limpar texto para fontes padrão do PDF ---
  const cleanForPDF = (text: string) => {
    return text
      .replace(/[^\x00-\x7F\x80-\xFF]/g, '') // Remove caracteres non-WinAnsi (Unicode acima de 255)
      .replace(/[\u2500-\u257F]/g, '')        // Remove caracteres de desenho de caixa (═, ─, │, etc)
      .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-') // Converte bullets especiais em hífens
      .replace(/[📋📝📊⚠️✨🔍💡]/gu, '')      // Remove emojis específicos que podem ter sobrado
      .trim()
  }

  // --- Função Auxiliar de Header ---
  const drawHeader = (isFirstPage = false) => {
    if (isFirstPage) {
      // Título Principal
      doc.setTextColor(...colors.accent)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text(cleanForPDF(title).toUpperCase(), margin, 35)

      // Data e Identificador
      const dateStr = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.muted)
      doc.text(`TECHNICAL REPORT | GENERATED ON ${dateStr.toUpperCase()}`, margin, 42)

      // Linha Minimalista Superior
      doc.setDrawColor(...colors.accent)
      doc.setLineWidth(0.8)
      doc.line(margin, 48, margin + 20, 48)

      currentY = 65
    } else {
      // Header das demais páginas
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.muted)
      doc.text(cleanForPDF(title).toUpperCase(), margin, 15)
      doc.text('PATENT ANALYSIS', pageWidth - margin, 15, { align: 'right' })
      
      doc.setDrawColor(...colors.light)
      doc.setLineWidth(0.2)
      doc.line(margin, 18, pageWidth - margin, 18)
      currentY = 30
    }
  }

  // --- Funções de Rodapé ---
  const drawFooter = () => {
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(...colors.muted)
      
      // Linha fina de separação
      doc.setDrawColor(...colors.light)
      doc.setLineWidth(0.2)
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20)

      // Paginação
      doc.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' })
      
      // Disclaimer discreto
      doc.setFontSize(7)
      doc.text('DOCUMENT GENERATED VIA AI - CONFIDENTIAL', margin, pageHeight - 12)
    }
  }

  // Início do Processamento
  drawHeader(true)

  const lines = result.split('\n')
  doc.setTextColor(...colors.text)

  for (const line of lines) {
    let trimmedLine = line.trim()
    
    // Pula linhas que são apenas caracteres de decoração (como barreiras de equal ou hífens longos)
    if (/^[═─-]{3,}$/.test(trimmedLine)) continue
    
    if (trimmedLine === '' && currentY > 200) continue

    // Nova página se necessário
    if (currentY > pageHeight - margin - 20) {
      doc.addPage()
      drawHeader(false)
      doc.setTextColor(...colors.text)
      doc.setFontSize(10)
    }

    // Lógica de Estilização Minimalista
    const isHeader = trimmedLine.startsWith('📋') || trimmedLine.startsWith('📝') || 
                     trimmedLine.startsWith('📊') || trimmedLine.startsWith('⚠️') ||
                     trimmedLine.includes('RESUMO') || trimmedLine.includes('SUMMARY') ||
                     trimmedLine.includes('CONCLUSÃO') || trimmedLine.includes('CONCLUSION') ||
                     (trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length > 5 && trimmedLine.length < 50);

    if (isHeader) {
      currentY += 4
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...colors.accent)
      
      const cleanText = cleanForPDF(trimmedLine).toUpperCase()
      if (cleanText) {
        doc.text(cleanText, margin, currentY)
        
        // Sublinhado decorativo curto
        doc.setDrawColor(...colors.light)
        doc.setLineWidth(0.3)
        doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2)
        
        currentY += lineHeight + 4
      }
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...colors.text)

    } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
      // Bullets limpos
      const cleanLine = '- ' + cleanForPDF(trimmedLine.substring(1))
      const wrappedLines = doc.splitTextToSize(cleanLine, contentWidth - 5)
      for (const wl of wrappedLines) {
        if (currentY > pageHeight - margin - 20) {
          doc.addPage()
          drawHeader(false)
        }
        doc.text(wl, margin + 4, currentY)
        currentY += lineHeight
      }
    } else if (trimmedLine === '') {
      currentY += lineHeight / 1.5
    } else {
      // Texto normal limpo
      const cleanLine = cleanForPDF(trimmedLine)
      if (cleanLine) {
        const wrappedLines = doc.splitTextToSize(cleanLine, contentWidth)
        for (const wl of wrappedLines) {
          if (currentY > pageHeight - margin - 20) {
            doc.addPage()
            drawHeader(false)
          }
          doc.text(wl, margin, currentY)
          currentY += lineHeight
        }
      }
    }
  }

  drawFooter()

  const filenameClean = cleanForPDF(filename).replace(/\s+/g, '-')
  const timestamp = new Date().toISOString().split('T')[0]
  doc.save(`${filenameClean}-${timestamp}.pdf`)
}

