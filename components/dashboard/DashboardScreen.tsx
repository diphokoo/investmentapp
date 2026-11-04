import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BalanceCard from './BalanceCard';
import BottomNav, { NavTab } from './BottomNav';
import { useAuth } from '@/lib/auth-context';
import { fetchDashboardData, DashboardData, LoanRecord } from '@/lib/supabase';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatLoanAmount(cents: number) {
  return `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

const LOAN_STATUS_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  pending:   { icon: 'time-outline',             color: '#d97706', bg: '#fffbeb' },
  approved:  { icon: 'checkmark-circle-outline',  color: '#16a34a', bg: '#f0fdf4' },
  active:    { icon: 'cash-outline',              color: '#2563eb', bg: '#eff6ff' },
  disbursed: { icon: 'arrow-down-circle',         color: '#16a34a', bg: '#f0fdf4' },
  rejected:  { icon: 'close-circle-outline',      color: '#dc2626', bg: '#fef2f2' },
  closed:    { icon: 'checkmark-done-outline',    color: '#64748b', bg: '#f8fafc' },
  defaulted: { icon: 'alert-circle-outline',      color: '#dc2626', bg: '#fef2f2' },
};

function loanStyle(status: string) {
  return LOAN_STATUS_STYLE[status] ?? { icon: 'document-outline', color: '#64748b', bg: '#f8fafc' };
}

const QUICK_ACTIONS = [
  { label: 'Apply',    icon: 'cash-outline',     bg: '#f0fdf4', color: '#16a34a', nav: 'loans' },
  { label: 'Home',     icon: 'home',             bg: '#fdf4ff', color: '#9333ea', nav: 'history' },
  { label: 'Settings', icon: 'settings-outline', bg: '#fff7ed', color: '#ea580c', nav: 'settings' },
];

interface Props { onNavChange?: (tab: NavTab) => void }

export default function DashboardScreen({ onNavChange }: Props) {
  const { user } = useAuth();
  const [activeNav, setActiveNav]     = useState<NavTab>('history');
  const [dashData, setDashData]       = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const firstName = user?.first_name ?? user?.email?.split('@')[0] ?? 'there';

  const load = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const d = await fetchDashboardData(user.id, user.credit_limit ?? 0);
      setDashData(d);
    } catch {
      // silently fail — UI shows zeros
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleNav = (tab: NavTab) => {
    setActiveNav(tab);
    onNavChange?.(tab);
    if (tab === 'history') load();
  };

  const availableCredit = dashData?.availableCredit ?? 0;
  const outstanding     = dashData?.outstanding ?? 0;
  const nextDueDate     = dashData?.nextDueDate ?? undefined;
  const recentLoans     = dashData?.recentLoans ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <View style={styles.root}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{firstName} 👋</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.75}>
              <Ionicons name="notifications-outline" size={22} color="#1e293b" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <BalanceCard
            availableCredit={availableCredit}
            outstanding={outstanding}
            nextDueDate={nextDueDate}
          />

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

          {/* Repayment banner — only when there is an outstanding balance with a due date */}
          {outstanding > 0 && nextDueDate && (
            <View style={styles.loanBanner}>
              <View style={styles.loanBannerLeft}>
                <Ionicons name="alert-circle" size={20} color="#d97706" />
                <View>
                  <Text style={styles.loanBannerTitle}>Repayment Due</Text>
                  <Text style={styles.loanBannerSub}>
                    R{outstanding.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} due on {nextDueDate}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => handleNav('history')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {loadingData ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#16a34a" />
              </View>
            ) : (
              <View style={styles.activityList}>
                {recentLoans.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Ionicons name="document-outline" size={36} color="#cbd5e1" />
                    <Text style={styles.emptyText}>No loan applications yet</Text>
                  </View>
                ) : (
                  recentLoans.map((loan: LoanRecord) => {
                    const s      = loanStyle(loan.status);
                    const amount = loan.approved_amount != null
                      ? formatLoanAmount(loan.approved_amount)
                      : formatLoanAmount(loan.requested_amount);
                    const date = formatDate(loan.submitted_at ?? loan.created_at);
                    return (
                      <View key={loan.id} style={styles.activityRow}>
                        <View style={[styles.activityIcon, { backgroundColor: s.bg }]}>
                          <Ionicons name={s.icon as any} size={20} color={s.color} />
                        </View>
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityLabel}>Loan Application</Text>
                          <Text style={styles.activityDate}>{date}</Text>
                        </View>
                        <View style={styles.activityRight}>
                          <Text style={[styles.activityAmount, { color: s.color }]}>{amount}</Text>
                          <Text style={[styles.activityStatus, { color: s.color }]}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </View>

        </ScrollView>
        <BottomNav active={activeNav} onChange={handleNav} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#f0f4f8' },
  root:          { flex: 1 },
  scroll:        { flex: 1 },
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
  qaBtn:   { flex: 1, alignItems: 'center', gap: 8 },
  qaIcon:  { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 11, fontWeight: '600', color: '#475569' },
  loanBanner: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: '#fffbeb',
    borderRadius: 14, padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#fde68a',
  },
  loanBannerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  loanBannerTitle: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  loanBannerSub:   { fontSize: 11, color: '#b45309', marginTop: 1 },
  payNowBtn:  { backgroundColor: '#d97706', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  payNowText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  section:       { marginTop: 20, marginHorizontal: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle:  { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  seeAll:        { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  loadingWrap:   { padding: 32, alignItems: 'center' },
  activityList: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  activityIcon:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityInfo:   { flex: 1 },
  activityLabel:  { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  activityDate:   { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  activityRight:  { alignItems: 'flex-end', gap: 2 },
  activityAmount: { fontSize: 14, fontWeight: '700' },
  activityStatus: { fontSize: 10, fontWeight: '600' },
  emptyWrap:      { padding: 32, alignItems: 'center', gap: 8 },
  emptyText:      { fontSize: 14, color: '#94a3b8' },
});
