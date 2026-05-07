import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface Props extends TextInputProps {
  label: string;
  icon?: string;
  hint?: string;
  error?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export default function InputField({ label, icon, hint, error, rightIcon, onRightIconPress, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.group}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      <View style={[styles.wrapper, focused && styles.wrapperFocused, !!error && styles.wrapperError]}>
        {icon && <Ionicons name={icon as any} size={18} color="#94a3b8" style={styles.iconLeft} />}
        <TextInput
          style={styles.input}
          placeholderTextColor="#cbd5e1"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.iconRight}>
            <Ionicons name={rightIcon as any} size={18} color="#94a3b8" />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', letterSpacing: 0.3 },
  hint: { fontSize: 11, color: '#94a3b8' },
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 12, height: 50,
  },
  wrapperFocused: {
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 2,
  },
  wrapperError: { borderColor: '#dc2626' },
  iconLeft: { marginRight: 10 },
  iconRight: { padding: 4 },
  input: { flex: 1, fontSize: 15, color: '#1e293b' },
  error: { fontSize: 11, color: '#dc2626', marginTop: 2 },
});
