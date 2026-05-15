'use client'

import { useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface PlanPDFExportProps {
  planName: string
  strategy: string
  createdAt: string
}

export default function PlanPDFExport({ planName, strategy, createdAt }: PlanPDFExportProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  async function handleExportPDF() {
    if (!contentRef.current) return

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      pdf.save(`${planName}-${strategy}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    }
  }

  return (
    <>
      <button
        onClick={handleExportPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        📥 Descargar PDF
      </button>
      <div ref={contentRef} className="hidden">
        <div className="p-8 bg-white">
          <h1 className="text-3xl font-bold mb-2">{planName}</h1>
          <p className="text-gray-600 mb-6">
            Estrategia: <span className="font-semibold">{strategy}</span> • {new Date(createdAt).toLocaleDateString('es')}
          </p>
        </div>
      </div>
    </>
  )
}

export function PDFContent({ children }: { children: React.ReactNode }) {
  return <div className="print:block">{children}</div>
}
