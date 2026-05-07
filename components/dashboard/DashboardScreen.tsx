import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BalanceCard from './BalanceCard';
import BottomNav, { NavTab } from './BottomNav';

const USER_NAME = 'Alex';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface Props { onNavChange?: (tab: NavTab) => void }

const RECENT_ACTIVITY = [
  { id: '1', label: 'Salary Advance', amount: '+R3,000.00', date: '15 Jul', icon: 'arrow-down-circle', color: '#16a34a', bg: '#f0fdf4' },
  { id: '2', label: 'Loan Repayment', amount: '-R1,200.00', date: '01 Jul', icon: 'arrow-up-circle', color: '#dc2626', bg: '#fef2f2' },
  { id: '3', label: 'Service Fee', amount: '-R150.00', date: '01 Jul', icon: 'receipt-outline', color: '#d97706', bg: '#fffbeb' },
];

export default function DashboardScreen({ onNavChange }: Props) {
  const [activeNav, setActiveNav] = useState<NavTab>('history');

  const handleNav = (tab: NavTab) => {
    setActiveNav(tab);
    onNavChange?.(tab);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <View style={styles.root}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{USER_NAME} 👋</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.75}>
              <Ionicons name="notifications-outline" size={22} color="#1e293b" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <BalanceCard availableCredit={5000} outstanding={2500} nextDueDate="30 Jul 2025" />

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.label}
                style={styles.qaBtn}
                activeOpacity={0.75}
                onPress={() => action.nav && handleNav(action.nav as NavTab)}
              >
                <View style={[styles.qaIcon, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text style={styles.qaLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Loan Status Banner */}
          <View style={styles.loanBanner}>
            <View style={styles.loanBannerLeft}>
              <Ionicons name="alert-circle" size={20} color="#d97706" />
              <View>
                <Text style={styles.loanBannerTitle}>Repayment Due</Text>
                <Text style={styles.loanBannerSub}>R2,500.00 due on 30 Jul 2025</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.payNowBtn} onPress={() => handleNav('send')}>
              <Text style={styles.payNowText}>Pay Now</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => handleNav('history')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityList}>
              {RECENT_ACTIVITY.map(item => (
                <View key={item.id} style={styles.activityRow}>
                  <View style={[styles.activityIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityLabel}>{item.label}</Text>
                    <Text style={styles.activityDate}>{item.date}</Text>
                  </View>
                  <Text style={[styles.activityAmount, { color: item.color }]}>{item.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <BottomNav active={activeNav} onChange={handleNav} />
      </View>
    </SafeAreaView>
  );
}

const QUICK_ACTIONS = [
  { label: 'Apply',   icon: 'cash-outline',        bg: '#eff6ff', color: '#2563eb', nav: 'loans' },
  { label: 'Send',    icon: 'paper-plane-outline',  bg: '#f0fdf4', color: '#16a34a', nav: 'send' },
  { label: 'History', icon: 'time-outline',         bg: '#fdf4ff', color: '#9333ea', nav: 'history' },
  { label: 'Settings',icon: 'settings-outline',     bg: '#fff7ed', color: '#ea580c', nav: 'settings' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  greeting: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  bellBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  badge: {
    position: 'absolute', top: 9, right: 9, width: 8, height: 8,
    borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#fff',
  },
  quickActions: {
    flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 20,
    backgroundColor: '#ffffff', borderRadius: 18, paddingVertical: 18, paddingHorizontal: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  qaBtn: { flex: 1, alignItems: 'center', gap: 8 },
  qaIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 11, fontWeight: '600', color: '#475569' },
  loanBanner: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: '#fffbeb',
    borderRadius: 14, padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#fde68a',
  },
  loanBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  loanBannerTitle: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  loanBannerSub: { fontSize: 11, color: '#b45309', marginTop: 1 },
  payNowBtn: {
    backgroundColor: '#d97706', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10,
  },
  payNowText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  section: { marginTop: 20, marginHorizontal: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
  activityList: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  activityIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  activityDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  activityAmount: { fontSize: 14, fontWeight: '700' },
});
