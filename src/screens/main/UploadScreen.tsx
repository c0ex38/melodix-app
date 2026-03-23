import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArtistForm } from '../../components/forms/ArtistForm';
import { AlbumForm } from '../../components/forms/AlbumForm';
import { SongForm } from '../../components/forms/SongForm';

export const UploadScreen = () => {
  const [activeTab, setActiveTab] = useState<'artist' | 'album' | 'song'>('artist');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Veri Yönetimi</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'artist' && styles.activeTab]}
          onPress={() => setActiveTab('artist')}
        >
          <Text style={[styles.tabText, activeTab === 'artist' && styles.activeTabText]}>Sanatçı</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'album' && styles.activeTab]}
          onPress={() => setActiveTab('album')}
        >
          <Text style={[styles.tabText, activeTab === 'album' && styles.activeTabText]}>Albüm</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'song' && styles.activeTab]}
          onPress={() => setActiveTab('song')}
        >
          <Text style={[styles.tabText, activeTab === 'song' && styles.activeTabText]}>Şarkı</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContainer}>
        {activeTab === 'artist' && <ArtistForm />}
        {activeTab === 'album' && <AlbumForm />}
        {activeTab === 'song' && <SongForm />}
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    padding: 20,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 6,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#383838',
  },
  tabText: {
    fontFamily: 'Manrope_500Medium',
    color: '#777575',
    fontSize: 14,
  },
  activeTabText: {
    color: '#db90ff',
    fontFamily: 'Manrope_700Bold',
  },
  formContainer: {
    flex: 1,
  }
});
