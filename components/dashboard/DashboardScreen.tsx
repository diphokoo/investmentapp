import { Ionicons } from '@expo/vector-icons';
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
import BalanceCard from './BalanceCard';
import BottomNav, { NavTab } from './BottomNav';
import EmptyState from './EmptyState';
import FilterTabs, { FilterTab } from './FilterTabs';
import SearchBar from './SearchBar';

const USER_NAME = 'Alex';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface Props { onNavChange?: (tab: NavTab) => void }

export default function DashboardScreen({ onNavChange }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [activeNav, setActiveNav] = useState<NavTab>('history');

  const handleNav = (tab: NavTab) => {
    setActiveNav(tab);
    onNavChange?.(tab);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />

      <View style={styles.root}>
        {/* ── Scrollable body ── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{USER_NAME} 👋</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.75}>
              <Ionicons name="notifications-outline" size={22} color="#1e293b" />
              {/* Unread badge */}
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <BalanceCard />

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity key={action.label} style={styles.qaBtn} activeOpacity={0.75}>
                <View style={[styles.qaIcon, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text style={styles.qaLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Transaction Section */}
          <View style={styles.section}>
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transaction History</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <SearchBar />

            {/* Filter tabs */}
            <FilterTabs active={activeFilter} onChange={setActiveFilter} />

            {/* Empty state */}
            <EmptyState />
          </View>
        </ScrollView>

        {/* ── Bottom Nav (fixed) ── */}
        <BottomNav active={activeNav} onChange={handleNav} />
      </View>
    </SafeAreaView>
  );
}

const QUICK_ACTIONS = [
  { label: 'Send',    icon: 'paper-plane-outline', bg: '#eff6ff', color: '#2563eb' },
  { label: 'Receive', icon: 'download-outline',    bg: '#f0fdf4', color: '#16a34a' },
  { label: 'Pay',     icon: 'card-outline',         bg: '#fdf4ff', color: '#9333ea' },
  { label: 'More',    icon: 'grid-outline',          bg: '#fff7ed', color: '#ea580c' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  /* Quick Actions */
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  qaBtn: { flex: 1, alignItems: 'center', gap: 8 },
  qaIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },

  /* Transaction section */
  section: {
    marginTop: 24,
    marginHorizontal: 20,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
});
