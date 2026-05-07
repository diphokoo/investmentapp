import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TABS = ['All', 'Sent', 'Received'] as const;
type FilterTab = typeof TABS[number];

interface Props {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
}

export default function FilterTabs({ active, onChange }: Props) {
  return (
    <View style={styles.row}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.pill, active === tab && styles.pillActive]}
          onPress={() => onChange(tab)}
          activeOpacity={0.75}
        >
          <Text style={[styles.pillText, active === tab && styles.pillTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export type { FilterTab };

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  pillActive: {
    backgroundColor: '#1e3a8a',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  pillText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  pillTextActive: { color: '#ffffff' },
});
