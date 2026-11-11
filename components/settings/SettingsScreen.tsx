import { useAuth } from '@/lib/auth-context';
import { fetchDashboardData } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminScreen from '../admin/AdminScreen';
import BottomNav, { NavTab } from '../dashboard/BottomNav';
import AppearanceScreen from './AppearanceScreen';
import HelpScreen from './HelpScreen';
import KYCScreen from './KYCScreen';
import LanguageScreen from './LanguageScreen';
import NotificationsScreen from './NotificationsScreen';
import ProfileScreen from './ProfileScreen';
import SettingsItem from './shared/SettingsItem';
import ToggleRow from './shared/ToggleRow';

type SubScreen = 'profile' | 'kyc' | 'notifications' | 'language' | 'appearance' | 'help' | null;
interface Props { onNavChange: (tab: NavTab) => void; onAdminPress?: () => void }

const money = (amount: number) => `R${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatUpdatedTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

export default function SettingsScreen({ onNavChange }: Props) {
  const { user, updateUser } = useAuth();
  const [subScreen, setSubScreen] = useState<SubScreen>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [availableCredit, setAvailableCredit] = useState<number | null>(null);
  const [creditUpdatedAt, setCreditUpdatedAt] = useState<Date | null>(null);
  const [savingAppearance, setSavingAppearance] = useState(false);

  useEffect(() => {
    let active = true;
    if (user?.id) {
      fetchDashboardData(user.id, user.credit_limit)
        .then(data => {
          if (active) {
            setAvailableCredit(data.availableCredit);
            setCreditUpdatedAt(new Date());
          }
        })
        .catch(() => {
          if (active) {
            setAvailableCredit(Math.max(0, user.credit_limit) / 100);
            setCreditUpdatedAt(new Date());
          }
        });
    }
    return () => { active = false; };
  }, [user?.id, user?.credit_limit]);

  const darkMode = user?.appearance === 'dark';
  const setDarkMode = async (value: boolean) => {
    if (savingAppearance) return;
    setSavingAppearance(true);
    try { await updateUser({ appearance: value ? 'dark' : 'light' }); }
    catch (error: any) { Alert.alert('Could not save appearance', error.message ?? 'Please try again.'); }
    finally { setSavingAppearance(false); }
  };

  if (subScreen === 'profile') return <ProfileScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'kyc') return <KYCScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'notifications') return <NotificationsScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'language') return <LanguageScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'appearance') return <AppearanceScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'help') return <HelpScreen onBack={() => setSubScreen(null)} />;

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your account';
  const initial = fullName.charAt(0).toUpperCase();
  const verified = user?.kyc_status?.toLowerCase() === 'verified';
  const isAdmin = ['admin', 'super_admin'].includes(
    user?.role?.toLowerCase() ?? ''
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <View style={styles.root}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View><Text style={styles.pageTitle}>Settings</Text><Text style={styles.pageSub}>Manage your account and preferences</Text></View>
            <View style={styles.bellBtn}><Ionicons name="notifications-outline" size={22} color="#1e293b" /></View>
          </View>

          <LinearGradient colors={['#14532d', '#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>{fullName}</Text>
                  {verified && <View style={styles.verifiedBadge}><Ionicons name="shield-checkmark" size={11} color="#16a34a" /><Text style={styles.verifiedText}>Verified</Text></View>}
                </View>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.balanceLabel}>AVAILABLE CREDIT</Text>
                <Text style={styles.balanceAmount}>{availableCredit === null ? 'Loading…' : money(availableCredit)}</Text>
                <Text style={styles.balanceUpdated}>{creditUpdatedAt ? `Updated ${formatUpdatedTime(creditUpdatedAt)}` : 'Updating credit…'}</Text>
              </View>
              <View style={styles.walletIcon}><Ionicons name="wallet-outline" size={26} color="rgba(255,255,255,0.85)" /></View>
            </View>
          </LinearGradient>

          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <SettingsItem icon="person-outline" iconBg="#f0fdf4" iconColor="#16a34a" label="Profile Information" onPress={() => setSubScreen('profile')} />
            <SettingsItem icon="shield-checkmark-outline" iconBg="#f0fdf4" iconColor="#16a34a" label="KYC Verification"
              value={verified ? undefined : (user?.kyc_status || 'Pending')} badge={verified ? 'Verified' : undefined}
              onPress={() => setSubScreen('kyc')} hideBorder />
          </View>

          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.card}>
            <SettingsItem icon="notifications-outline" iconBg="#fff7ed" iconColor="#ea580c" label="Notifications" onPress={() => setSubScreen('notifications')} />
            <ToggleRow icon="moon-outline" iconBg="#f8fafc" iconColor="#475569" label="Dark Mode" value={darkMode} onToggle={setDarkMode} />
            <SettingsItem icon="language-outline" iconBg="#f0fdf4" iconColor="#16a34a" label="Language"
              value={user?.language || 'en'} onPress={() => setSubScreen('language')} />
            <SettingsItem icon="color-palette-outline" iconBg="#fdf4ff" iconColor="#7c3aed" label="Appearance"
              value={darkMode ? 'Dark' : 'Light'} onPress={() => setSubScreen('appearance')} hideBorder />
          </View>

          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={styles.card}>
            <SettingsItem icon="help-circle-outline" iconBg="#f0fdf4" iconColor="#16a34a" label="Help Center" onPress={() => setSubScreen('help')} />
            {isAdmin && <SettingsItem icon="shield-outline" iconBg="#fef2f2" iconColor="#dc2626" label="Admin Panel" onPress={() => setShowAdmin(true)} hideBorder />}
          </View>
          <Text style={styles.version}>PayAdvance v1.0.0 · NCR Reg. NCRCP0000 · © 2025</Text>
        </ScrollView>
        <BottomNav active="settings" onChange={onNavChange} />
      </View>
      <Modal visible={showAdmin} animationType="slide" onRequestClose={() => setShowAdmin(false)}>
        <AdminScreen onClose={() => setShowAdmin(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' }, root: { flex: 1 }, scroll: { flex: 1 }, scrollContent: { paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' }, pageSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  bellBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  profileCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' }, profileInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, profileName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#16a34a' }, profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5 },
  balanceAmount: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 }, balanceUpdated: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  walletIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginHorizontal: 20, marginTop: 24, marginBottom: 10 },
  card: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  version: { textAlign: 'center', fontSize: 12, color: '#cbd5e1', marginTop: 28, marginBottom: 4 },
});
