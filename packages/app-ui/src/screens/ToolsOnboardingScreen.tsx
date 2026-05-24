import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Text } from '@couragegang/design-system'
import { colors, fontSize, radius, spacing } from '@couragegang/design-system/tokens'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import { localizedLabel } from '@couragegang/shared/mcp'
import { useWorkspaceInstallations } from '@couragegang/shared/hooks'
import type { McpCatalogItem, McpInstallation } from '@couragegang/shared/types'

import { ErrorBanner } from '../components/ErrorBanner'
import { McpInstallSheet } from '../components/McpInstallSheet'
import { McpInstallationEditSheet } from '../components/McpInstallationEditSheet'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'

type Step = 'welcome' | 'connect' | 'configure' | 'chat'

const STEPS: Step[] = ['welcome', 'connect', 'configure', 'chat']

export type ToolsOnboardingScreenProps = {
  api: BffApi
  onFinish: () => void
  onSkip: () => void
}

export function ToolsOnboardingScreen({ api, onFinish, onSkip }: ToolsOnboardingScreenProps) {
  const insets = useSafeAreaInsets()
  const { workspaceId } = useAuth()
  const { items, loading: toolsLoading, reload, hasTools } = useWorkspaceInstallations(
    api,
    workspaceId,
  )

  const [step, setStep] = useState<Step>('welcome')
  const [catalog, setCatalog] = useState<McpCatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [selected, setSelected] = useState<McpCatalogItem | null>(null)
  const [editing, setEditing] = useState<McpInstallation | null>(null)
  const [healthMessage, setHealthMessage] = useState('')
  const [healthOk, setHealthOk] = useState<boolean | null>(null)
  const [healthBusy, setHealthBusy] = useState(false)

  useEffect(() => {
    setCatalogLoading(true)
    setCatalogError('')
    void api
      .catalog()
      .then((res) => setCatalog((res as { items?: McpCatalogItem[] }).items ?? []))
      .catch((e) => setCatalogError(String(e)))
      .finally(() => setCatalogLoading(false))
  }, [api])

  useEffect(() => {
    if (hasTools && step === 'welcome') {
      setStep('configure')
    }
  }, [hasTools, step])

  async function onHealth(item: McpInstallation) {
    if (!workspaceId) return
    setHealthBusy(true)
    setHealthMessage('')
    setHealthOk(null)
    try {
      const res = (await api.healthInstallation(workspaceId, item.id)) as {
        ok?: boolean
        message?: string
      }
      setHealthOk(!!res.ok)
      setHealthMessage(
        res.ok ? strings.connections.healthOk : strings.connections.healthFail(res.message ?? ''),
      )
      await reload()
    } catch (e) {
      setHealthOk(false)
      setHealthMessage(e instanceof ApiError ? (e.body ?? e.message) : String(e))
    } finally {
      setHealthBusy(false)
    }
  }

  function onInstalled() {
    void reload()
    setStep('configure')
  }

  const stepIndex = STEPS.indexOf(step)

  if (!workspaceId) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.empty}>
          <Text variant="muted">{strings.context.noWorkspace}</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.scroll,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.eyebrow}>{strings.onboarding.eyebrow}</Text>
          <Text style={styles.title}>{strings.onboarding.title}</Text>
        </View>
        <Pressable onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>{strings.onboarding.skip}</Text>
        </Pressable>
      </View>

      <View style={styles.stepsRow}>
        {STEPS.map((id, i) => {
          const done = i <= stepIndex
          const current = i === stepIndex
          return (
            <View key={id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepNum,
                  done && styles.stepNumDone,
                  current && styles.stepNumCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumText,
                    current && styles.stepNumTextCurrent,
                    done && !current && styles.stepNumTextDone,
                  ]}
                >
                  {i + 1}
                </Text>
              </View>
              <Text style={styles.stepLabel} numberOfLines={2}>
                {strings.onboarding.steps[id]}
              </Text>
            </View>
          )
        })}
      </View>

      <View style={styles.body}>
        {step === 'welcome' && (
          <>
            <Text style={styles.lead}>{strings.onboarding.welcomeLead}</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bullet}>• {strings.onboarding.welcomePoint1}</Text>
              <Text style={styles.bullet}>• {strings.onboarding.welcomePoint2}</Text>
              <Text style={styles.bullet}>• {strings.onboarding.welcomePoint3}</Text>
            </View>
            <Button title={strings.onboarding.start} onPress={() => setStep('connect')} />
          </>
        )}

        {step === 'connect' && (
          <>
            <Text style={styles.sectionTitle}>{strings.onboarding.connectTitle}</Text>
            <Text variant="muted" style={styles.hint}>
              {strings.onboarding.connectHint}
            </Text>
            {catalogLoading && <Text variant="muted">{strings.common.loading}</Text>}
            <ErrorBanner message={catalogError} />
            {catalog.map((c) => (
              <Pressable key={c.connectorKey} style={styles.card} onPress={() => setSelected(c)}>
                <Text style={styles.cardTitle}>
                  {localizedLabel(c.displayName, c.connectorKey)}
                </Text>
                <Text variant="muted">{c.connectorKey}</Text>
                {c.description ? <Text variant="muted">{c.description}</Text> : null}
                <Text style={styles.badge}>{strings.mcp.addTool}</Text>
              </Pressable>
            ))}
            {!catalogLoading && catalog.length === 0 && !catalogError && (
              <Text variant="muted">{strings.mcp.catalogEmpty}</Text>
            )}
            {hasTools && (
              <Text style={styles.success}>{strings.onboarding.connectedCount(items.length)}</Text>
            )}
            <View style={styles.actions}>
              <Button title={strings.onboarding.back} variant="ghost" onPress={() => setStep('welcome')} />
              <Button
                title={strings.onboarding.next}
                onPress={() => setStep('configure')}
                disabled={!hasTools}
              />
            </View>
          </>
        )}

        {step === 'configure' && (
          <>
            <Text style={styles.sectionTitle}>{strings.onboarding.configureTitle}</Text>
            <Text variant="muted" style={styles.hint}>
              {strings.onboarding.configureHint}
            </Text>
            {toolsLoading && <Text variant="muted">{strings.common.loading}</Text>}
            {!toolsLoading && items.length === 0 && (
              <Text variant="muted">{strings.connections.empty}</Text>
            )}
            {items.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardTitle}>{item.displayLabel ?? item.connectorKey}</Text>
                <Text variant="muted">{item.connectorKey}</Text>
                <Text variant="muted">{item.status ?? 'active'}</Text>
                <View style={styles.cardActions}>
                  <Button
                    title={strings.connections.edit}
                    variant="secondary"
                    onPress={() => setEditing(item)}
                  />
                  <Button
                    title={strings.connections.healthCheck}
                    variant="ghost"
                    onPress={() => void onHealth(item)}
                    disabled={healthBusy}
                  />
                </View>
              </View>
            ))}
            {healthMessage ? (
              <Text style={healthOk ? styles.success : styles.errorText}>{healthMessage}</Text>
            ) : null}
            <View style={styles.actions}>
              <Button title={strings.onboarding.back} variant="ghost" onPress={() => setStep('connect')} />
              <Button
                title={strings.onboarding.next}
                onPress={() => setStep('chat')}
                disabled={!hasTools}
              />
            </View>
          </>
        )}

        {step === 'chat' && (
          <>
            <Text style={styles.sectionTitle}>{strings.onboarding.chatTitle}</Text>
            <Text variant="muted" style={styles.hint}>
              {strings.onboarding.chatHint}
            </Text>
            <Text style={styles.examplesLabel}>{strings.onboarding.examplesLabel}</Text>
            <View style={styles.example}>
              <Text style={styles.exampleText}>{strings.onboarding.example1}</Text>
            </View>
            <View style={styles.example}>
              <Text style={styles.exampleText}>{strings.onboarding.example2}</Text>
            </View>
            <Text variant="muted" style={styles.hitlNote}>
              {strings.onboarding.hitlNote}
            </Text>
            <View style={styles.actions}>
              <Button
                title={strings.onboarding.back}
                variant="ghost"
                onPress={() => setStep('configure')}
              />
              <Button title={strings.onboarding.finish} onPress={onFinish} />
            </View>
          </>
        )}
      </View>

      <McpInstallSheet
        api={api}
        item={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        onInstalled={onInstalled}
      />
      <McpInstallationEditSheet
        api={api}
        workspaceId={workspaceId}
        installation={editing}
        visible={!!editing}
        onClose={() => setEditing(null)}
        onSaved={() => void reload()}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headText: { flex: 1 },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, lineHeight: 32 },
  skipBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  skipText: { fontSize: fontSize.md, color: colors.primary, fontWeight: '500' },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  stepItem: { flex: 1, alignItems: 'center', gap: 6 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumDone: { borderColor: colors.primary, backgroundColor: colors.accentSoft },
  stepNumCurrent: { borderColor: colors.primary, backgroundColor: colors.primary },
  stepNumText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  stepNumTextDone: { color: colors.primary },
  stepNumTextCurrent: { color: '#fff' },
  stepLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  body: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  lead: { fontSize: 15, lineHeight: 23, color: colors.text },
  bulletList: { gap: spacing.sm, marginBottom: spacing.sm },
  bullet: { fontSize: 15, lineHeight: 22, color: colors.text },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  hint: { lineHeight: 21 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.bg,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  success: { color: colors.success, fontSize: fontSize.sm },
  errorText: { color: colors.danger, fontSize: fontSize.sm },
  examplesLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  example: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    backgroundColor: colors.accentSoft,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  exampleText: { fontSize: 14, lineHeight: 20, color: colors.text },
  hitlNote: { fontSize: 13, lineHeight: 20 },
})
