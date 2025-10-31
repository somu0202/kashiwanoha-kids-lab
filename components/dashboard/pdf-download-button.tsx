'use client'

import { Button } from '@/components/ui/button'
import { generateAssessmentPDF } from '@/lib/pdf-generator'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

interface PDFDownloadButtonProps {
  assessmentData: {
    child: {
      first_name: string
      last_name: string
      birthdate: string
      grade: string
    }
    assessment: {
      assessed_at: string
      memo?: string
    }
    coach: {
      full_name: string
    }
    fms_scores: {
      run: number
      balance_beam: number
      jump: number
      throw: number
      catch: number
      dribble: number
      roll: number
    }
    smc_scores?: {
      shuttle_run_sec?: number
      paper_ball_throw_m?: number
    }
  }
  chartElementId?: string
}

export function PDFDownloadButton({
  assessmentData,
  chartElementId = 'radar-chart-for-pdf',
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    try {
      setIsGenerating(true)
      toast.info('PDFを生成しています...')

      // Get the chart element
      const chartElement = document.getElementById(chartElementId)

      // Generate PDF
      await generateAssessmentPDF(assessmentData, chartElement)

      toast.success('PDFをダウンロードしました！')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('PDF生成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <span className="animate-spin">⏳</span>
          生成中...
        </>
      ) : (
        <>
          📄 PDFダウンロード
        </>
      )}
    </Button>
  )
}
