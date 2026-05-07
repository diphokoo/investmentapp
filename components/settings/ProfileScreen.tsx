import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from './shared/InputField';
import SubScreenShell from './shared/SubScreenShell';

interface Props { onBack: () => void }

export default function ProfileScreen({ onBack }: Props) {
  const [name, setName]   = useState('Johnny');
  const [email, setEmail] = useState('johnny@example.com');
  const [phone, setPhone] = useState('+27 82 000 0000');

  return (
    <SubScreenShell title="Profile Information" onBack={onBack}>
      {/* Avatar */}
      <View style={styles.avatarRow}>
        <LinearGradient colors={['#1d4ed8', '#7c3aed']} style={styles.avatar}>
          <Text style={styles.avatarText}>J</Text>
        </LinearGradient>
        <TouchableOpacity style={styles.changePhoto} activeOpacity={0.75}>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <InputField label="Full Name"     value={name}  onChangeText={setName}  placeholder="Full name" />
        <InputField label="Email Address" value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        <InputField label="Phone Number"  value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />
      </View>

      {/* Save */}
      <TouchableOpacity activeOpacity={0.85} style={styles.btnWrap}>
        <LinearGradient colors={['#1d4ed8', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
          <Text style={styles.btnText}>Save Changes</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SubScreenShell>
  );
}

const styles = StyleSheet.create({
  avatarRow: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  changePhoto: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#bfdbfe', backgroundColor: '#eff6ff',
  },
  changePhotoText: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  btnWrap: {
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  btn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
