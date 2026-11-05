import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type NavTab = 'history' | 'loans' | 'settings' | 'logout';

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const TABS: { key: NavTab; label: string; icon: string; activeIcon: string; danger?: boolean }[] = [
  { key: 'history',  label: 'Home',  icon: 'home',        activeIcon: 'home' },
  { key: 'loans',    label: 'Loans',    icon: 'cash-outline',        activeIcon: 'cash' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline',    activeIcon: 'settings' },
  { key: 'logout',   label: 'Logout',   icon: 'log-out-outline',     activeIcon: 'log-out-outline', danger: true },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map(tab => {
        const isActive = active === tab.key;
        const color = tab.danger ? '#ef4444' : isActive ? '#16a34a' : '#94a3b8';
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            {isActive && !tab.danger && <View style={styles.activePill} />}
            <Ionicons
              name={(isActive ? tab.activeIcon : tab.icon) as any}
              size={21}
              color={color}
            />
            <Text style={[styles.label, isActive && !tab.danger && styles.labelActive, tab.danger && styles.labelDanger]}>{tab.label}</Text>
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
    borderRadius: 2, backgroundColor: '#16a34a',
  },
  label:       { fontSize: 10, fontWeight: '500', color: '#94a3b8' },
  labelActive: { color: '#16a34a', fontWeight: '700' },
  labelDanger: { color: '#ef4444', fontWeight: '600' },
});
