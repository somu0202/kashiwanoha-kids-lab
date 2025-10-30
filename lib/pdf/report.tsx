import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { FMS_CATEGORIES, FMS_ORDER } from '@/lib/constants/fms'
import { formatAge } from '@/lib/utils/age'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #0ea5e9',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  childInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#374151',
  },
  infoValue: {
    flex: 1,
    color: '#111827',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    borderBottom: '1pt solid #e2e8f0',
    paddingBottom: 5,
  },
  smcCard: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  smcItem: {
    flex: 1,
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    border: '1pt solid #0ea5e9',
  },
  smcLabel: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 3,
  },
  smcValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  smcUnit: {
    fontSize: 12,
    color: '#6b7280',
  },
  table: {
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e2e8f0',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5,
  },
  memo: {
    padding: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 4,
    minHeight: 100,
    color: '#111827',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: '1pt solid #e2e8f0',
    paddingTop: 10,
    fontSize: 8,
    color: '#6b7280',
  },
})

interface ReportData {
  child: {
    first_name: string
    last_name: string
    birthdate: string
    grade?: string
  }
  assessment: {
    assessed_at: string
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
  memo?: string
}

export function AssessmentReport({ data }: { data: ReportData }) {
  const { child, assessment, coach, fms_scores, smc_scores, memo } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kashiwanoha Kids Lab</Text>
          <Text style={styles.subtitle}>運動能力評価レポート</Text>
        </View>

        {/* Child Information */}
        <View style={styles.childInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>氏名:</Text>
            <Text style={styles.infoValue}>
              {child.last_name} {child.first_name}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>年齢:</Text>
            <Text style={styles.infoValue}>{formatAge(child.birthdate)}</Text>
          </View>
          {child.grade && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>学年:</Text>
              <Text style={styles.infoValue}>{child.grade}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>評価日:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(assessment.assessed_at), 'yyyy年M月d日', {
                locale: ja,
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>担当コーチ:</Text>
            <Text style={styles.infoValue}>{coach.full_name}</Text>
          </View>
        </View>

        {/* SMC Scores */}
        {smc_scores && (smc_scores.shuttle_run_sec || smc_scores.paper_ball_throw_m) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SMC-Kids 測定結果</Text>
            <View style={styles.smcCard}>
              {smc_scores.shuttle_run_sec && (
                <View style={styles.smcItem}>
                  <Text style={styles.smcLabel}>10m折り返し走（合計40m）</Text>
                  <Text style={styles.smcValue}>
                    {smc_scores.shuttle_run_sec.toFixed(2)}{' '}
                    <Text style={styles.smcUnit}>秒</Text>
                  </Text>
                </View>
              )}
              {smc_scores.paper_ball_throw_m && (
                <View style={styles.smcItem}>
                  <Text style={styles.smcLabel}>紙ボール投げ</Text>
                  <Text style={styles.smcValue}>
                    {smc_scores.paper_ball_throw_m.toFixed(1)}{' '}
                    <Text style={styles.smcUnit}>m</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* FMS Scores Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7つの基礎動作の到達段階</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>動作</Text>
              <Text style={styles.tableCell}>スコア</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>評価</Text>
            </View>
            {FMS_ORDER.map((key) => {
              const score = fms_scores[key]
              const evaluation =
                score >= 4
                  ? '良好'
                  : score >= 3
                  ? '標準'
                  : score >= 2
                  ? '発展中'
                  : '要支援'
              return (
                <View key={key} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {FMS_CATEGORIES[key].label}
                  </Text>
                  <Text style={styles.tableCell}>{score} / 5</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{evaluation}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Memo */}
        {memo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>所見・次回のフォーカス</Text>
            <View style={styles.memo}>
              <Text>{memo}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>© Kashiwanoha Kids Lab - 運動能力評価システム</Text>
        </View>
      </Page>
    </Document>
  )
}
