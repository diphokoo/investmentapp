import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';

interface Props {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  hideBorder?: boolean;
}

export default function ToggleRow({
  icon, iconBg, iconColor, label, value, onToggle, hideBorder,
}: Props) {
  return (
    <View style={[styles.row, hideBorder && styles.noBorder]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
        thumbColor={value ? '#2563eb' : '#f1f5f9'}
        ios_backgroundColor="#e2e8f0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 14,
  },
  noBorder: { borderBottomWidth: 0 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e293b' },
});
