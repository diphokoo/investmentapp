import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchBar() {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, focused && styles.wrapperFocused]}>
      <Ionicons name="search-outline" size={17} color="#94a3b8" style={styles.iconLeft} />
      <TextInput
        style={styles.input}
        placeholder="Search transactions..."
        placeholderTextColor="#b0bec5"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <TouchableOpacity style={styles.filterBtn}>
        <Ionicons name="options-outline" size={17} color="#64748b" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8edf2',
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  wrapperFocused: {
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  iconLeft: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#1e293b' },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
