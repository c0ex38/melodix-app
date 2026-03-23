import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

const TAB_CONFIG: Record<string, { label: string; icon: string; iconFocused: string }> = {
  Home:    { label: 'Keşfet',  icon: 'musical-notes-outline',  iconFocused: 'musical-notes' },
  Upload:  { label: 'Yükle',   icon: 'cloud-upload-outline',   iconFocused: 'cloud-upload' },
  Profile: { label: 'Profil',  icon: 'person-outline',         iconFocused: 'person' },
};

export const GlassTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.wrapper}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={styles.innerContainer}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name] || { label: route.name, icon: 'ellipse-outline', iconFocused: 'ellipse' };

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[styles.tab, isFocused && styles.activeTab]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={(isFocused ? config.iconFocused : config.icon) as any}
                  size={22}
                  color={isFocused ? '#db90ff' : '#777575'}
                />
                <Text style={[styles.label, isFocused && styles.activeLabel]}>
                  {config.label}
                </Text>
                {isFocused && <View style={styles.indicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 16,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  blurContainer: {
    width: width - 48,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(219, 144, 255, 0.25)',
    // Shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#db90ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  innerContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 20, 0.75)',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(219, 144, 255, 0.1)',
  },
  label: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#777575',
  },
  activeLabel: {
    fontFamily: 'Manrope_700Bold',
    color: '#db90ff',
  },
  indicator: {
    position: 'absolute',
    bottom: 4,
    width: 16,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#db90ff',
  },
});
