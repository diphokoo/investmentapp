import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ToggleRow from './shared/ToggleRow';
import SubScreenShell from './shared/SubScreenShell';
import { useAuth } from '@/lib/auth-context';

interface Props { onBack: () => void }

export default function NotificationsScreen({ onBack }: Props) {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const enabled = user?.notifications_enabled ?? true;

  const toggle = async (value: boolean) => {
    if (saving) return;
    setSaving(true);
    try {
      await updateUser({ notifications_enabled: value });
    } catch (error: any) {
      Alert.alert('Could not update notifications', error.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubScreenShell title="Notifications" onBack={onBack}>
      <Text style={styles.hint}>
        Manage your account notification preference. This setting controls the single notification preference stored on your account.
      </Text>
      <View style={styles.card}>
        <ToggleRow
          icon="notifications-outline" iconBg="#eff6ff" iconColor="#2563eb"
          label="Notifications" value={enabled} onToggle={toggle} hideBorder
        />
      </View>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
});
