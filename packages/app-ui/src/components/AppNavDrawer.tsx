import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Animated,
  Easing,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors } from '@couragegang/design-system/tokens'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useChatDrawer } from '../context/ChatDrawerContext'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'
import type { DrawerFocusSection } from './ChatContextFooter'
import { ChatThreadListDrawer } from './ChatThreadListDrawer'
import { DrawerContextSection } from './DrawerContextSection'

export type { DrawerFocusSection }

const DRAWER_MAX_WIDTH = 360
const DRAWER_OPEN_MS = 280
const DRAWER_CLOSE_MS = 220
const SECTION_BODY_MS = 220

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

type Props = {
  open: boolean
  onClose: () => void
  focusSection?: DrawerFocusSection | null
  onNavigate: (path: string) => void
  onLogout: () => void
}

export function AppNavDrawer({ open, onClose, focusSection = null, onNavigate, onLogout }: Props) {
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const drawerWidth = Math.min(DRAWER_MAX_WIDTH, screenWidth * 0.92)

  const { userDisplayName, userEmail, logout } = useAuth()
  const { registration: chatReg } = useChatDrawer()
  const [expanded, setExpanded] = useState<DrawerFocusSection | null>(null)
  const [visible, setVisible] = useState(false)
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (open) {
      setVisible(true)
      progress.setValue(0)
      Animated.timing(progress, {
        toValue: 1,
        duration: DRAWER_OPEN_MS,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: true,
      }).start()
      return
    }

    if (!visible) return

    Animated.timing(progress, {
      toValue: 0,
      duration: DRAWER_CLOSE_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false)
    })
  }, [open, visible, progress])

  useEffect(() => {
    if (!open) return
    setExpanded(focusSection ?? 'chats')
  }, [open, focusSection])

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [drawerWidth, 0],
  })

  function go(path: string) {
    onClose()
    onNavigate(path)
  }

  function toggleSection(id: DrawerFocusSection) {
    LayoutAnimation.configureNext({
      duration: SECTION_BODY_MS,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    })
    setExpanded((cur) => (cur === id ? null : id))
  }

  async function handleLogout() {
    onClose()
    await logout()
    onLogout()
  }

  if (!visible) return null

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdropWrap, { opacity: backdropOpacity }]}>
          <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={strings.app.closeMenu} />
        </Animated.View>
        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.head}>
            <Text style={styles.brand}>Courage Gang</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel={strings.app.closeMenu}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.sections} keyboardShouldPersistTaps="handled">
            {chatReg && (
              <DrawerSection
                title={strings.app.section.chats}
                expanded={expanded === 'chats'}
                onToggle={() => toggleSection('chats')}
              >
                <ChatThreadListDrawer
                  conversations={chatReg.conversations}
                  activeId={chatReg.activeId}
                  showArchived={chatReg.showArchived}
                  onToggleArchived={chatReg.onToggleArchived}
                  onSelect={chatReg.onSelect}
                  onNew={chatReg.onNew}
                  onArchive={chatReg.onArchive}
                  onDelete={chatReg.onDelete}
                  onAfterSelect={onClose}
                  onAfterNew={onClose}
                />
              </DrawerSection>
            )}

            <DrawerSection
              title={strings.app.section.tools}
              expanded={expanded === 'tools'}
              onToggle={() => toggleSection('tools')}
            >
              <DrawerLink label={strings.nav.mcp} onPress={() => go('/mcp')} index={0} animate={expanded === 'tools'} />
              <DrawerLink
                label={strings.nav.connections}
                onPress={() => go('/connections')}
                index={1}
                animate={expanded === 'tools'}
              />
            </DrawerSection>

            <DrawerSection
              title={strings.app.section.context}
              expanded={expanded === 'context'}
              onToggle={() => toggleSection('context')}
            >
              <DrawerContextSection onClose={onClose} />
            </DrawerSection>

            <DrawerSection
              title={strings.app.section.account}
              expanded={expanded === 'account'}
              onToggle={() => toggleSection('account')}
            >
              {(userDisplayName || userEmail) && (
                <View style={styles.userMeta}>
                  {userDisplayName ? <Text style={styles.userName}>{userDisplayName}</Text> : null}
                  {userEmail ? <Text style={styles.userEmail}>{userEmail}</Text> : null}
                </View>
              )}
              <DrawerLink
                label={strings.header.settings}
                onPress={() => go('/profile')}
                index={0}
                animate={expanded === 'account'}
              />
              <DrawerLink
                label={strings.profile.logout}
                onPress={() => void handleLogout()}
                danger
                index={1}
                animate={expanded === 'account'}
              />
            </DrawerSection>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

function DrawerSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const chevron = useRef(new Animated.Value(expanded ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(chevron, {
      toValue: expanded ? 1 : 0,
      duration: SECTION_BODY_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [expanded, chevron])

  const chevronRotate = chevron.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  })

  return (
    <View style={styles.section}>
      <Pressable style={styles.sectionToggle} onPress={onToggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Animated.Text style={[styles.chevron, { transform: [{ rotate: chevronRotate }] }]}>▸</Animated.Text>
      </Pressable>
      {expanded ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  )
}

function DrawerLink({
  label,
  onPress,
  danger,
  index,
  animate,
}: {
  label: string
  onPress: () => void
  danger?: boolean
  index: number
  animate: boolean
}) {
  const opacity = useRef(new Animated.Value(animate ? 0 : 1)).current
  const translateY = useRef(new Animated.Value(animate ? -6 : 0)).current

  useEffect(() => {
    if (!animate) {
      opacity.setValue(1)
      translateY.setValue(0)
      return
    }
    opacity.setValue(0)
    translateY.setValue(-6)
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: SECTION_BODY_MS,
        delay: 40 + index * 45,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: SECTION_BODY_MS,
        delay: 40 + index * 45,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [animate, index, opacity, translateY])

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable style={styles.link} onPress={onPress}>
        <Text style={[styles.linkText, danger && styles.linkDanger]}>{label}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdropWrap: { ...StyleSheet.absoluteFillObject },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  brand: { fontWeight: '700', fontSize: 15, color: colors.text },
  close: { fontSize: 28, lineHeight: 28, color: colors.textMuted },
  sections: { flex: 1, paddingBottom: 24 },
  section: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  chevron: { color: colors.textMuted, fontSize: 12 },
  sectionBody: { paddingHorizontal: 18, paddingBottom: 16, gap: 8 },
  link: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  linkText: { fontSize: 14, color: colors.text },
  linkDanger: { color: colors.danger },
  userMeta: { paddingHorizontal: 12, paddingBottom: 4, gap: 2 },
  userName: { fontWeight: '600', fontSize: 14, color: colors.text },
  userEmail: { fontSize: 12, color: colors.textMuted },
})
