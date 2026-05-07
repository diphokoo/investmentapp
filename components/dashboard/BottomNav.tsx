import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type NavTab = 'send' | 'history' | 'loans' | 'settings' | 'logout';

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const TABS: { key: NavTab; label: string; icon: string; activeIcon: string }[] = [
  { key: 'send',     label: 'Send',     icon: 'paper-plane-outline', activeIcon: 'paper-plane' },
  { key: 'history',  label: 'History',  icon: 'time-outline',        activeIcon: 'time' },
  { key: 'loans',    label: 'Loans',    icon: 'cash-outline',        activeIcon: 'cash' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline',    activeIcon: 'settings' },
  { key: 'logout',   label: 'Logout',   icon: 'log-out-outline',     activeIcon: 'log-out-outline' },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map(tab => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.activePill} />}
            <Ionicons
              name={(isActive ? tab.activeIcon : tab.icon) as any}
              size={21}
              color={isActive ? '#2563eb' : '#94a3b8'}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', backgroundColor: '#ffffff',
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
    paddingBottom: 20, paddingTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative', paddingTop: 6 },
  activePill: {
    position: 'absolute', top: 0, width: 24, height: 3,
    borderRadius: 2, backgroundColor: '#2563eb',
  },
  label: { fontSize: 10, fontWeight: '500', color: '#94a3b8' },
  labelActive: { color: '#2563eb', fontWeight: '700' },
});
