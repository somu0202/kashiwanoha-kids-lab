import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface AssessmentData {
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
    throw_ball: number
    catch_ball: number
    dribble: number
    roll: number
  }
  smc_scores?: {
    height?: number
    weight?: number
    sit_and_reach?: number
    grip_strength_left?: number
    grip_strength_right?: number
  }
}

export async function generateAssessmentPDF(
  data: AssessmentData,
  chartElement: HTMLElement | null
): Promise<void> {
  // Create a new PDF document (A4 size)
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Set Japanese font (using built-in fonts)
  pdf.setFont('helvetica', 'normal')

  // Title
  pdf.setFontSize(20)
  pdf.text('運動能力評価レポート', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  // Child information section
  pdf.setFontSize(14)
  pdf.text('受検者情報', 15, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  pdf.text(`氏名: ${data.child.last_name} ${data.child.first_name}`, 20, yPosition)
  yPosition += 6
  pdf.text(`学年: ${data.child.grade}`, 20, yPosition)
  yPosition += 6
  pdf.text(
    `生年月日: ${new Date(data.child.birthdate).toLocaleDateString('ja-JP')}`,
    20,
    yPosition
  )
  yPosition += 6
  pdf.text(
    `評価日: ${new Date(data.assessment.assessed_at).toLocaleDateString('ja-JP')}`,
    20,
    yPosition
  )
  yPosition += 6
  pdf.text(`担当コーチ: ${data.coach.full_name}`, 20, yPosition)
  yPosition += 12

  // FMS Scores section
  pdf.setFontSize(14)
  pdf.text('FMS評価結果', 15, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  const fmsItems = [
    { label: '走る', value: data.fms_scores.run },
    { label: '平均台', value: data.fms_scores.balance_beam },
    { label: '跳ぶ', value: data.fms_scores.jump },
    { label: '投げる', value: data.fms_scores.throw_ball },
    { label: '捕る', value: data.fms_scores.catch_ball },
    { label: 'ドリブル', value: data.fms_scores.dribble },
    { label: '転がす', value: data.fms_scores.roll },
  ]

  fmsItems.forEach((item) => {
    pdf.text(`${item.label}: ${item.value} / 5`, 20, yPosition)
    yPosition += 6
  })
  yPosition += 6

  // SMC Scores section (if available)
  if (data.smc_scores) {
    pdf.setFontSize(14)
    pdf.text('SMC-Kids測定結果', 15, yPosition)
    yPosition += 8

    pdf.setFontSize(10)
    if (data.smc_scores.height) {
      pdf.text(`身長: ${data.smc_scores.height} cm`, 20, yPosition)
      yPosition += 6
    }
    if (data.smc_scores.weight) {
      pdf.text(`体重: ${data.smc_scores.weight} kg`, 20, yPosition)
      yPosition += 6
    }
    if (data.smc_scores.sit_and_reach) {
      pdf.text(`長座体前屈: ${data.smc_scores.sit_and_reach} cm`, 20, yPosition)
      yPosition += 6
    }
    if (data.smc_scores.grip_strength_left) {
      pdf.text(`握力(左): ${data.smc_scores.grip_strength_left} kg`, 20, yPosition)
      yPosition += 6
    }
    if (data.smc_scores.grip_strength_right) {
      pdf.text(`握力(右): ${data.smc_scores.grip_strength_right} kg`, 20, yPosition)
      yPosition += 6
    }
    yPosition += 6
  }

  // Add radar chart if available
  if (chartElement) {
    try {
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(14)
      pdf.text('レーダーチャート', 15, yPosition)
      yPosition += 8

      // Convert chart to canvas
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      })

      // Calculate dimensions to fit on page
      const imgWidth = pageWidth - 30
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add chart image to PDF
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 10
    } catch (error) {
      console.error('Error adding chart to PDF:', error)
    }
  }

  // Memo section (if available)
  if (data.assessment.memo && data.assessment.memo.trim()) {
    // Check if we need a new page
    if (yPosition > pageHeight - 50) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(14)
    pdf.text('メモ', 15, yPosition)
    yPosition += 8

    pdf.setFontSize(10)
    const memoLines = pdf.splitTextToSize(data.assessment.memo, pageWidth - 30)
    pdf.text(memoLines, 20, yPosition)
  }

  // Save the PDF
  const fileName = `assessment_${data.child.last_name}${data.child.first_name}_${new Date(
    data.assessment.assessed_at
  )
    .toLocaleDateString('ja-JP')
    .replace(/\//g, '')}.pdf`
  pdf.save(fileName)
}
