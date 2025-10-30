import { v4 as uuidv4 } from 'uuid'
import { addDays } from 'date-fns'

/**
 * 共有リンク用のトークンを生成する
 */
export function generateShareToken(): string {
  // UUIDv4ベースの安全なトークン
  return uuidv4().replace(/-/g, '')
}

/**
 * 有効期限を計算する
 * @param days - 日数（デフォルト7日）
 */
export function calculateExpiresAt(days: number = 7): Date {
  return addDays(new Date(), days)
}

/**
 * トークンの有効期限が切れているかチェック
 */
export function isTokenExpired(expiresAt: string | Date): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  return expiry < new Date()
}

/**
 * ワンタイムトークンが使用済みかチェック
 */
export function isTokenUsed(oneTime: boolean, accessedAt: string | null): boolean {
  return oneTime && accessedAt !== null
}
