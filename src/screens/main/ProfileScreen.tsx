import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export const ProfileScreen = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) getProfile();
  }, [user]);

  async function getProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setAvatarUrl(data.avatar_url ? `${data.avatar_url}?t=${new Date().getTime()}` : null);
        setUsername(data.username);
      }
    } catch (error) {
      console.log('Profil getirme hatası:', error);
    }
  }

  async function uploadAvatar() {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("İzin Gerekli", "Kameranıza veya galerinize erişim izni vermelisiniz.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (result.canceled || !result.assets || !result.assets[0].base64) {
        return;
      }

      setUploading(true);

      const ext = result.assets[0].uri.substring(result.assets[0].uri.lastIndexOf('.') + 1);
      const filePath = `${user?.id}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(result.assets[0].base64), {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const newAvatarUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;
      
      setAvatarUrl(`${newAvatarUrl}?t=${new Date().getTime()}`);
      Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi!');
      
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Fotoğraf yüklenemedi.');
    } finally {
      setUploading(false);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Melodix Profile</Text>

      <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
        <View style={styles.avatarContainer}>
          {uploading ? (
            <ActivityIndicator color="#db90ff" />
          ) : avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarPlaceholder}>+</Text>
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>{username || 'Kullanıcı'}</Text>
      <Text style={styles.subtitle}>{user?.email}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0e0e',
  },
  brand: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#ffffff',
    position: 'absolute',
    top: 60,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#db90ff',
    overflow: 'hidden',
  },
  avatar: {
    width: 120,
    height: 120,
  },
  avatarPlaceholder: {
    fontSize: 40,
    color: '#777575',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: '#adaaaa',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#262626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ff4d4d', // Red border for signout
  },
  buttonText: {
    fontFamily: 'Manrope_700Bold',
    color: '#ff4d4d',
    fontSize: 16,
  },
});
