import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../../lib/supabase';

export const LoginScreen = ({ navigation }: any) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    let finalEmail = emailOrUsername.trim().toLowerCase();

    // If there is no @ symbol, assume it's a username and fetch the email
    if (!finalEmail.includes('@')) {
      const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_username', { p_username: finalEmail });
      
      if (rpcError || !emailData) {
        Alert.alert('Hata', 'Girdiğiniz kullanıcı adına ait bir hesap bulunamadı.');
        setLoading(false);
        return;
      }
      finalEmail = emailData;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password,
    });

    if (error) Alert.alert('Hata', error.message);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.header}>
          <Text style={styles.brand}>Melodix</Text>
          <Text style={styles.headline}>Tekrar Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>Müziğin ritmine devam etmek için bilgilerinizi girin.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="E-posta veya Kullanıcı Adı"
            placeholderTextColor="#777575"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#777575"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={signInWithEmail} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Kayıt Ol</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotText: {
    fontFamily: 'Manrope_500Medium',
    color: '#db90ff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#db90ff',
    paddingVertical: 18,
    borderRadius: 999, // Full rounding
    alignItems: 'center',
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
