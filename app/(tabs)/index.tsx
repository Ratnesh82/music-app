import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MiniPlayer } from '@/components/MiniPlayer';
import { usePlayerStore } from '@/stores/playerStore';
import { useMusicStore } from '@/stores/musicStore';

export default function HomeScreen() {
  const { tracks, isLoading, error, fetchTracks } = useMusicStore();
  const playTrack = usePlayerStore((state) => state.playTrack);

  useEffect(() => {
    fetchTracks();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.greeting}>Good evening</Text>
        
        <Text style={styles.sectionTitle}>Your Library</Text>
        <View style={styles.tracksContainer}>
          {tracks.map((track) => (
            <TouchableOpacity
              key={track.id}
              style={styles.track}
              onPress={() => playTrack(track)}>
              <Image source={{ uri: track.artwork }} style={styles.trackArtwork} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackArtist}>{track.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  greeting: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 48,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  tracksContainer: {
    marginBottom: 24,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#282828',
    borderRadius: 8,
  },
  trackArtwork: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  trackInfo: {
    marginLeft: 12,
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 4,
  },
});