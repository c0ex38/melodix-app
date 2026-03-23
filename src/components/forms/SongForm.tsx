import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../../lib/supabase';
import { decode } from 'base64-arraybuffer';

export const SongForm = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');

  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    if (selectedArtistId) fetchAlbums(selectedArtistId);
  }, [selectedArtistId]);

  const fetchArtists = async () => {
    const { data, error } = await supabase.from('artists').select('id, name').order('name');
    if (!error && data) {
      setArtists(data);
      if (data.length > 0) setSelectedArtistId(data[0].id);
    }
  };

  const fetchAlbums = async (artistId: string) => {
    const { data, error } = await supabase.from('albums').select('id, title').eq('artist_id', artistId).order('title');
    if (!error && data) {
      setAlbums(data);
      if (data.length > 0) {
        setSelectedAlbumId(data[0].id);
      } else {
        setSelectedAlbumId('');
      }
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFileUri(result.assets[0].uri);
        setFileName(result.assets[0].name);
      }
    } catch (err) {
      console.log('Dosya seçme hatası:', err);
    }
  };

  const handleNext = () => {
    if (step === 1 && !title.trim()) {
      Alert.alert('Hata', 'Lütfen şarkı adını girin.');
      return;
    }
    if (step === 2 && !selectedArtistId) {
      Alert.alert('Hata', 'Lütfen bir sanatçı seçin.');
      return;
    }
    if (step === 3 && !selectedAlbumId) {
      Alert.alert('Hata', 'Lütfen bir albüm seçin.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!fileUri) {
      Alert.alert('Hata', 'Lütfen bir ses dosyası seçin.');
      return;
    }

    setLoading(true);

    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
      const ext = fileName.split('.').pop();
      const storageFileName = `songs/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(storageFileName, decode(base64), { contentType: `audio/${ext}` });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('music').getPublicUrl(storageFileName);
      const audioUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('songs')
        .insert({
          title: title.trim(),
          artist_id: selectedArtistId,
          album_id: selectedAlbumId,
          audio_url: audioUrl,
          duration: duration ? parseInt(duration) : null,
        });

      if (dbError) throw dbError;

      Alert.alert('Başarılı', 'Şarkı başarıyla eklendi!');
      setTitle('');
      setDuration('');
      setFileName('');
      setFileUri(null);
      setStep(1);

    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Şarkı eklenirken bir sorun oluştu.');
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
        {step === 1 && "Adım 1: Şarkı Adı"}
        {step === 2 && "Adım 2: Sanatçı Seçimi"}
        {step === 3 && "Adım 3: Albüm Seçimi"}
        {step === 4 && "Adım 4: MP3 ve Ses Dosyası"}
      </Text>

      <View style={styles.contentContainer}>
        {step === 1 && (
          <View>
            <Text style={styles.label}>Şarkı Adı *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Blinding Lights"
              placeholderTextColor="#777575"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.label}>Sanatçı Seçiniz *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedArtistId}
                onValueChange={(val) => setSelectedArtistId(val)}
                dropdownIconColor="#db90ff"
                style={styles.picker}
              >
                {artists.length === 0 ? (
                  <Picker.Item label="Sanatçı bulunamadı" value="" color="#fff" />
                ) : (
                  artists.map(a => <Picker.Item key={a.id} label={a.name} value={a.id} color="#fff" />)
                )}
              </Picker>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.label}>Albüm Seçiniz *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedAlbumId}
                onValueChange={(val) => setSelectedAlbumId(val)}
                dropdownIconColor="#db90ff"
                style={styles.picker}
              >
                {albums.length === 0 ? (
                  <Picker.Item label="Sanatçıya ait albüm yok" value="" color="#fff" />
                ) : (
                  albums.map(al => <Picker.Item key={al.id} label={al.title} value={al.id} color="#fff" />)
                )}
              </Picker>
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.label}>MP3 Dosyası Seç *</Text>
            <TouchableOpacity style={styles.documentPicker} onPress={pickDocument} disabled={loading}>
              <Text style={styles.documentPickerText}>
                {fileName ? fileName : 'Dosyayı Seçmek İçin Dokun'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 20 }]}>Süre (saniye) — İsteğe Bağlı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 214"
              placeholderTextColor="#777575"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              editable={!loading}
            />
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
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading || !fileUri}>
            {loading ? <ActivityIndicator color="#4d0070" /> : <Text style={styles.buttonText}>Şarkıyı Yükle</Text>}
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
  pickerContainer: { backgroundColor: '#262626', borderRadius: 12, overflow: 'hidden' },
  picker: { color: '#ffffff' },
  documentPicker: { backgroundColor: '#1a1a1a', padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#494847', borderStyle: 'dashed', alignItems: 'center' },
  documentPickerText: { fontFamily: 'Manrope_500Medium', color: '#db90ff', fontSize: 16, textAlign: 'center' },
  durationHint: { fontFamily: 'Manrope_500Medium', color: '#db90ff', fontSize: 12, marginTop: 12, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, gap: 16 },
  button: { flex: 1, backgroundColor: '#db90ff', paddingVertical: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { backgroundColor: '#262626', borderWidth: 1, borderColor: '#494847' },
  buttonText: { fontFamily: 'Manrope_700Bold', color: '#4d0070', fontSize: 16 },
  secondaryButtonText: { fontFamily: 'Manrope_700Bold', color: '#ffffff', fontSize: 16 },
  buttonDisabled: { opacity: 0.7 },
});
