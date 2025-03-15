import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { usePlayerStore } from '@/stores/playerStore';
import { useRouter } from 'expo-router';

export function MiniPlayer() {
  const router = useRouter();
  const { currentTrack, isPlaying, isBuffering, pauseTrack, resumeTrack } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push('/player')}
      activeOpacity={0.8}>
      <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          isPlaying ? pauseTrack() : resumeTrack();
        }}
        style={styles.playButton}
        disabled={isBuffering}>
        {isBuffering ? (
          <ActivityIndicator size="small" color="#1DB954" />
        ) : isPlaying ? (
          <Pause size={24} color="#fff" />
        ) : (
          <Play size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 49,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#282828',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  playButton: {
    marginLeft: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});