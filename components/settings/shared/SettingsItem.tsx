import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  badge?: string;
  onPress?: () => void;
  hideBorder?: boolean;
}

export default function SettingsItem({
  icon, iconBg, iconColor, label, value, badge, onPress, hideBorder,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.row, hideBorder && styles.noBorder]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {value && <Text style={styles.value}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
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
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 13, color: '#94a3b8' },
  badge: {
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
});
