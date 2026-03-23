import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../lib/supabase';
import { decode } from 'base64-arraybuffer';

export const AlbumForm = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    const { data, error } = await supabase.from('artists').select('id, name').order('name');
    if (!error && data) {
      setArtists(data);
      if (data.length > 0) setSelectedArtistId(data[0].id);
    }
  };

  const pickImage = async () => {
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

  const handleNext = () => {
    if (step === 1 && !selectedArtistId) {
      Alert.alert('Hata', 'Lütfen bir sanatçı seçin.');
      return;
    }
    if (step === 2 && !title.trim()) {
      Alert.alert('Hata', 'Lütfen albüm adını girin.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const formatDBDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDisplayDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let coverUrl = null;

      if (imageUri && imageBase64) {
        const ext = imageUri.substring(imageUri.lastIndexOf('.') + 1);
        const fileName = `albums/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, decode(imageBase64), { contentType: `image/${ext}` });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('covers').getPublicUrl(fileName);
        coverUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase
        .from('albums')
        .insert({
          title: title.trim(),
          artist_id: selectedArtistId,
          release_date: formatDBDate(releaseDate),
          cover_url: coverUrl,
        });

      if (dbError) throw dbError;

      Alert.alert('Başarılı', 'Albüm başarıyla eklendi!');
      setTitle('');
      setReleaseDate(new Date());
      setImageUri(null);
      setImageBase64(null);
      setStep(1);

    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Albüm eklenirken bir sorun oluştu.');
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
        {step === 1 && "Adım 1: Sanatçı Seçimi"}
        {step === 2 && "Adım 2: Albüm Adı"}
        {step === 3 && "Adım 3: Çıkış Tarihi"}
        {step === 4 && "Adım 4: Albüm Kapağı"}
      </Text>

      <View style={styles.contentContainer}>
        {step === 1 && (
          <View>
            <Text style={styles.label}>Hangi Sanatçının Albümü? *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedArtistId}
                onValueChange={(itemValue) => setSelectedArtistId(itemValue)}
                dropdownIconColor="#db90ff"
                style={styles.picker}
              >
                {artists.length === 0 ? (
                  <Picker.Item label="Sanatçı bulunamadı" value="" color="#fff" />
                ) : (
                  artists.map(artist => (
                    <Picker.Item key={artist.id} label={artist.name} value={artist.id} color="#fff" />
                  ))
                )}
              </Picker>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.label}>Albüm Adı *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Starboy"
              placeholderTextColor="#777575"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.label}>Çıkış Tarihi (Gün-Ay-Yıl)</Text>
            
            {Platform.OS === 'android' ? (
              <>
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: '#ffffff', fontFamily: 'Manrope_500Medium', fontSize: 16 }}>
                    {formatDisplayDate(releaseDate)}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={releaseDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setReleaseDate(selectedDate);
                    }}
                  />
                )}
              </>
            ) : (
              <View style={styles.datePickerContainerIOS}>
                 <DateTimePicker
                    value={releaseDate}
                    mode="date"
                    display="spinner"
                    themeVariant="dark"
                    textColor="#ffffff"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setReleaseDate(selectedDate);
                    }}
                  />
              </View>
            )}
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.label}>Albüm Kapağı Seç (Opsiyonel)</Text>
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
            {loading ? <ActivityIndicator color="#4d0070" /> : <Text style={styles.buttonText}>Albümü Kaydet</Text>}
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
  imagePicker: { height: 200, backgroundColor: '#262626', borderRadius: 12, borderWidth: 1, borderColor: '#494847', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  imagePickerText: { fontFamily: 'Manrope_500Medium', color: '#db90ff', fontSize: 16 },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  pickerContainer: { backgroundColor: '#262626', borderRadius: 12, overflow: 'hidden' },
  picker: { color: '#ffffff' },
  datePickerContainerIOS: { backgroundColor: '#262626', borderRadius: 12, overflow: 'hidden', padding: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, gap: 16 },
  button: { flex: 1, backgroundColor: '#db90ff', paddingVertical: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { backgroundColor: '#262626', borderWidth: 1, borderColor: '#494847' },
  buttonText: { fontFamily: 'Manrope_700Bold', color: '#4d0070', fontSize: 16 },
  secondaryButtonText: { fontFamily: 'Manrope_700Bold', color: '#ffffff', fontSize: 16 },
  buttonDisabled: { opacity: 0.7 },
});
