import { differenceInYears, differenceInMonths, parseISO } from 'date-fns'

/**
 * 年齢を計算する（年と月）
 * @param birthdate - 生年月日 (ISO文字列またはDate)
 * @param referenceDate - 基準日 (デフォルトは今日)
 * @returns { years: number, months: number }
 */
export function calculateAge(
  birthdate: string | Date,
  referenceDate: Date = new Date()
): { years: number; months: number } {
  const birth = typeof birthdate === 'string' ? parseISO(birthdate) : birthdate
  
  const years = differenceInYears(referenceDate, birth)
  const totalMonths = differenceInMonths(referenceDate, birth)
  const months = totalMonths % 12

  return { years, months }
}

/**
 * 年齢を文字列で表示（例：「7歳2ヶ月」）
 */
export function formatAge(birthdate: string | Date, referenceDate?: Date): string {
  const { years, months } = calculateAge(birthdate, referenceDate)
  return `${years}歳${months}ヶ月`
}
