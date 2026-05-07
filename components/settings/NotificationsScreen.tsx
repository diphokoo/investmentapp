import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ToggleRow from './shared/ToggleRow';
import SubScreenShell from './shared/SubScreenShell';

interface Props { onBack: () => void }

export default function NotificationsScreen({ onBack }: Props) {
  const [push,  setPush]  = useState(true);
  const [email, setEmail] = useState(true);
  const [sms,   setSms]   = useState(false);

  return (
    <SubScreenShell title="Notifications" onBack={onBack}>
      <Text style={styles.hint}>
        Choose how you'd like to be notified about account activity.
      </Text>

      <View style={styles.card}>
        <ToggleRow
          icon="notifications-outline" iconBg="#eff6ff" iconColor="#2563eb"
          label="Push Notifications" value={push} onToggle={setPush}
        />
        <ToggleRow
          icon="mail-outline" iconBg="#fdf4ff" iconColor="#9333ea"
          label="Email Notifications" value={email} onToggle={setEmail}
        />
        <ToggleRow
          icon="chatbubble-outline" iconBg="#f0fdf4" iconColor="#16a34a"
          label="SMS Notifications" value={sms} onToggle={setSms}
          hideBorder
        />
      </View>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
});
