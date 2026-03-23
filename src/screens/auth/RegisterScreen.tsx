import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../../lib/supabase';

export const RegisterScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        }
      }
    });

    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert('Başarılı', 'Kayıt başarılı! Lütfen giriş yapın.');
      navigation.navigate('Login');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.header}>
          <Text style={styles.brand}>Melodix</Text>
          <Text style={styles.headline}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Ritme katılın. Hemen keşfetmeye başlayın.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#777575"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor="#777575"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#777575"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Şifreyi Onayla"
            placeholderTextColor="#777575"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={signUpWithEmail} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  brand: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#db90ff',
    letterSpacing: -1,
    marginBottom: 16,
  },
  headline: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 40,
    color: '#ffffff',
    letterSpacing: -2,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: '#adaaaa',
  },
  form: {
    marginBottom: 40,
  },
  input: {
    fontFamily: 'Manrope_500Medium',
    backgroundColor: '#262626',
    color: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#db90ff',
    paddingVertical: 18,
    borderRadius: 999, // Full rounding
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontFamily: 'Manrope_700Bold',
    color: '#4d0070',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Manrope_400Regular',
    color: '#adaaaa',
    fontSize: 14,
  },
  linkText: {
    fontFamily: 'Manrope_700Bold',
    color: '#db90ff',
    fontSize: 14,
  },
});
