import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav, { NavTab } from '../dashboard/BottomNav';
import SettingsItem from './shared/SettingsItem';
import ToggleRow from './shared/ToggleRow';

// Sub-screens
import AppearanceScreen from './AppearanceScreen';
import HelpScreen from './HelpScreen';
import KYCScreen from './KYCScreen';
import LanguageScreen from './LanguageScreen';
import NotificationsScreen from './NotificationsScreen';
import ProfileScreen from './ProfileScreen';
import SecurityScreen from './SecurityScreen';

type SubScreen =
  | 'profile' | 'security' | 'kyc'
  | 'notifications' | 'language' | 'appearance' | 'help'
  | null;

interface Props { onNavChange: (tab: NavTab) => void }

export default function SettingsScreen({ onNavChange }: Props) {
  const [subScreen, setSubScreen] = useState<SubScreen>(null);
  const [darkMode, setDarkMode]   = useState(false);

  // ── Sub-screen router ──────────────────────────────────────────
  if (subScreen === 'profile')       return <ProfileScreen       onBack={() => setSubScreen(null)} />;
  if (subScreen === 'security')      return <SecurityScreen      onBack={() => setSubScreen(null)} />;
  if (subScreen === 'kyc')           return <KYCScreen           onBack={() => setSubScreen(null)} />;
  if (subScreen === 'notifications') return <NotificationsScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'language')      return <LanguageScreen      onBack={() => setSubScreen(null)} />;
  if (subScreen === 'appearance')    return <AppearanceScreen    onBack={() => setSubScreen(null)} />;
  if (subScreen === 'help')          return <HelpScreen          onBack={() => setSubScreen(null)} />;

  // ── Main settings screen ───────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <View style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Settings</Text>
              <Text style={styles.pageSub}>Manage your account and preferences</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.75}>
              <Ionicons name="notifications-outline" size={22} color="#1e293b" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>

          {/* ── Profile gradient card ── */}
          <LinearGradient
            colors={['#1d4ed8', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            {/* Avatar + info */}
            <View style={styles.profileTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>J</Text>
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>Johnny</Text>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={11} color="#16a34a" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
                <Text style={styles.profileEmail}>johnny@example.com</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.cardDivider} />

            {/* Balance */}
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
                <Text style={styles.balanceAmount}>R15,000.00</Text>
                <Text style={styles.balanceUpdated}>Updated 01:35 PM</Text>
              </View>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet-outline" size={26} color="rgba(255,255,255,0.85)" />
              </View>
            </View>
          </LinearGradient>

          {/* ── ACCOUNT section ── */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="person-outline" iconBg="#eff6ff" iconColor="#2563eb"
              label="Profile Information"
              onPress={() => setSubScreen('profile')}
            />
            <SettingsItem
              icon="lock-closed-outline" iconBg="#fdf4ff" iconColor="#9333ea"
              label="Security"
              onPress={() => setSubScreen('security')}
            />
            <SettingsItem
              icon="shield-checkmark-outline" iconBg="#f0fdf4" iconColor="#16a34a"
              label="KYC Verification"
              badge="Verified"
              onPress={() => setSubScreen('kyc')}
              hideBorder
            />
          </View>

          {/* ── PREFERENCES section ── */}
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="notifications-outline" iconBg="#fff7ed" iconColor="#ea580c"
              label="Notifications"
              onPress={() => setSubScreen('notifications')}
            />
            <ToggleRow
              icon="moon-outline" iconBg="#f8fafc" iconColor="#475569"
              label="Dark Mode"
              value={darkMode}
              onToggle={setDarkMode}
            />
            <SettingsItem
              icon="language-outline" iconBg="#eff6ff" iconColor="#0284c7"
              label="Language"
              value="English"
              onPress={() => setSubScreen('language')}
            />
            <SettingsItem
              icon="color-palette-outline" iconBg="#fdf4ff" iconColor="#7c3aed"
              label="Appearance"
              value="Light"
              onPress={() => setSubScreen('appearance')}
              hideBorder
            />
          </View>

          {/* ── SUPPORT section ── */}
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="help-circle-outline" iconBg="#f0fdf4" iconColor="#16a34a"
              label="Help Center"
              onPress={() => setSubScreen('help')}
              hideBorder
            />
          </View>

          {/* ── Version ── */}
          <Text style={styles.version}>Finvest v1.0.0 · © 2025</Text>
        </ScrollView>

        <BottomNav active="settings" onChange={onNavChange} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#f0f4f8' },
  root:        { flex: 1 },
  scroll:      { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  pageSub:   { fontSize: 13, color: '#64748b', marginTop: 2 },
  bellBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  badge: {
    position: 'absolute', top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#fff',
  },

  /* Profile card */
  profileCard: {
    marginHorizontal: 20, borderRadius: 20, padding: 20,
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  profileTop:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:  { fontSize: 24, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1, gap: 4 },
  nameRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#dcfce7', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  cardDivider:  { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  balanceRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5 },
  balanceAmount:  { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 },
  balanceUpdated: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  walletIcon: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Sections */
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#94a3b8',
    letterSpacing: 1, textTransform: 'uppercase',
    marginHorizontal: 20, marginTop: 24, marginBottom: 10,
  },
  card: {
    marginHorizontal: 20, backgroundColor: '#fff',
    borderRadius: 18, paddingHorizontal: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  version: {
    textAlign: 'center', fontSize: 12, color: '#cbd5e1',
    marginTop: 28, marginBottom: 4,
  },
});
