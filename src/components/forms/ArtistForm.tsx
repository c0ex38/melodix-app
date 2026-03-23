import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../lib/supabase';
import { decode } from 'base64-arraybuffer';

export const ArtistForm = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen sanatçı adını girin.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Galerinize erişim izni vermelisiniz.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let imageUrl = null;

      if (imageUri && imageBase64) {
        const ext = imageUri.substring(imageUri.lastIndexOf('.') + 1);
        const fileName = `artists/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, decode(imageBase64), { contentType: `image/${ext}` });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('covers').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase
        .from('artists')
        .insert({
          name: name.trim(),
          bio: bio.trim(),
          image_url: imageUrl,
        });

      if (dbError) throw dbError;

      Alert.alert('Başarılı', 'Sanatçı başarıyla eklendi!');
      
      setName('');
      setBio('');
      setImageUri(null);
      setImageBase64(null);
      setStep(1);

    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Sanatçı eklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[...Array(totalSteps)].map((_, i) => (
        <View key={i} style={[styles.stepDot, step >= i + 1 && styles.activeStepDot]} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderStepIndicator()}
      <Text style={styles.stepTitle}>
        {step === 1 && "Adım 1: Sanatçı Adı"}
        {step === 2 && "Adım 2: Biyografi (İsteğe Bağlı)"}
        {step === 3 && "Adım 3: Sanatçı Fotoğrafı"}
      </Text>

      <View style={styles.contentContainer}>
        {step === 1 && (
          <View>
            <Text style={styles.label}>Sanatçı Adı *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: The Weeknd"
              placeholderTextColor="#777575"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.label}>Biyografi</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Sanatçı hakkında kısa bir bilgi..."
              placeholderTextColor="#777575"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.label}>Profil Görseli Seç</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={loading}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imagePickerText}>Fotoğraf Seç</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        {step > 1 && (
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleBack} disabled={loading}>
            <Text style={styles.secondaryButtonText}>Geri</Text>
          </TouchableOpacity>
        )}
        
        {step < totalSteps && (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>İleri</Text>
          </TouchableOpacity>
        )}

        {step === totalSteps && (
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#4d0070" /> : <Text style={styles.buttonText}>Kaydet</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 100 },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 8 },
  stepDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#262626' },
  activeStepDot: { backgroundColor: '#db90ff' },
  stepTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: '#ffffff', marginBottom: 24, textAlign: 'center' },
  contentContainer: { minHeight: 200 },
  label: { fontFamily: 'Manrope_700Bold', color: '#adaaaa', fontSize: 13, marginBottom: 8, marginTop: 8 },
  input: { fontFamily: 'Manrope_500Medium', backgroundColor: '#262626', color: '#ffffff', padding: 16, borderRadius: 12, fontSize: 16 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  imagePicker: { height: 200, backgroundColor: '#262626', borderRadius: 12, borderWidth: 1, borderColor: '#494847', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  imagePickerText: { fontFamily: 'Manrope_500Medium', color: '#db90ff', fontSize: 16 },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, gap: 16 },
  button: { flex: 1, backgroundColor: '#db90ff', paddingVertical: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { backgroundColor: '#262626', borderWidth: 1, borderColor: '#494847' },
  buttonText: { fontFamily: 'Manrope_700Bold', color: '#4d0070', fontSize: 16 },
  secondaryButtonText: { fontFamily: 'Manrope_700Bold', color: '#ffffff', fontSize: 16 },
  buttonDisabled: { opacity: 0.7 },
});
