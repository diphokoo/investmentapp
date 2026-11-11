import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import InputField from './shared/InputField';
import SubScreenShell from './shared/SubScreenShell';

interface Props { onBack: () => void }

export default function ProfileScreen({ onBack }: Props) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName([user?.first_name, user?.last_name].filter(Boolean).join(' '));
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
  }, [user]);

  const save = async () => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length || !email.trim()) {
      Alert.alert('Missing information', 'Please enter your name and email address.');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        first_name: parts[0],
        last_name: parts.slice(1).join(' ') || null,
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
      });
      Alert.alert('Profile updated', 'Your account details have been saved.');
    } catch (error: any) {
      Alert.alert('Could not save changes', error.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubScreenShell title="Profile Information" onBack={onBack}>
      <View style={styles.avatarRow}>
        <LinearGradient colors={['#1d4ed8', '#7c3aed']} style={styles.avatar}>
          <Text style={styles.avatarText}>{(name.trim()[0] || '?').toUpperCase()}</Text>
        </LinearGradient>
      </View>
      <View style={styles.card}>
        <InputField label="Full Name" value={name} onChangeText={setName} placeholder="Full name" />
        <InputField label="Email Address" value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        <InputField label="Phone Number" value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />
      </View>
      <TouchableOpacity activeOpacity={0.85} style={styles.btnWrap} onPress={save} disabled={saving}>
        <LinearGradient colors={['#1d4ed8', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  avatarRow: { alignItems: 'center', paddingVertical: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  btnWrap: { borderRadius: 14, overflow: 'hidden', shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  btn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
