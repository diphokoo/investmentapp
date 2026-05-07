import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface Props {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'success' | 'outline';
  style?: ViewStyle;
}

const GRADIENTS = {
  primary: ['#1a56c4', '#3b82f6'] as const,
  danger:  ['#dc2626', '#ef4444'] as const,
  success: ['#15803d', '#16a34a'] as const,
  outline: ['#ffffff', '#ffffff'] as const,
};

export default function GradientButton({ label, onPress, loading, disabled, variant = 'primary', style }: Props) {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85} style={style}>
      <LinearGradient
        colors={GRADIENTS[variant]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.btn, isOutline && styles.outline, (disabled || loading) && styles.disabled]}
      >
        {loading
          ? <ActivityIndicator color={isOutline ? '#2563eb' : '#fff'} size="small" />
          : <Text style={[styles.text, isOutline && styles.textOutline]}>{label}</Text>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1a56c4', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  outline: { borderWidth: 1.5, borderColor: '#2563eb', shadowOpacity: 0 },
  disabled: { opacity: 0.55 },
  text: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  textOutline: { color: '#2563eb' },
});
