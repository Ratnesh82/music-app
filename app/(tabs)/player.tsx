import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  ChevronDown,
  Heart,
  Share2,
  ListMusic,
} from 'lucide-react-native';
import { usePlayerStore } from '@/stores/playerStore';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH - 48;

export default function PlayerScreen() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    playbackPosition,
    duration,
    pauseTrack,
    resumeTrack,
    seekTo,
  } = usePlayerStore();

  const scale = useSharedValue(1);
  const progress = useSharedValue(0);

  // Use useEffect to handle navigation instead of during render
  useEffect(() => {
    if (!currentTrack) {
      router.replace('/(tabs)');
    }
  }, [currentTrack]);

  const artworkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${(playbackPosition / (duration || 1)) * 100}%`,
    };
  });

  const handlePlayPause = () => {
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    isPlaying ? pauseTrack() : resumeTrack();
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Return early if no track, but don't navigate during render
  if (!currentTrack) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)')} 
          style={styles.backButton}>
          <ChevronDown size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity style={styles.menuButton}>
          <ListMusic size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.artworkContainer}>
        <Animated.Image
          source={{ uri: currentTrack.artwork }}
          style={[styles.artwork, artworkStyle]}
        />
      </View>

      <View style={styles.trackInfo}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{currentTrack.title}</Text>
          <TouchableOpacity>
            <Heart size={24} color="#B3B3B3" />
          </TouchableOpacity>
        </View>
        <Text style={styles.artist}>{currentTrack.artist}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progress, progressStyle]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(playbackPosition)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Shuffle size={24} color="#B3B3B3" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <SkipBack size={32} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          disabled={isBuffering}>
          {isBuffering ? (
            <ActivityIndicator size="large" color="#1DB954" />
          ) : isPlaying ? (
            <Pause size={40} color="#000" />
          ) : (
            <Play size={40} color="#000" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <SkipForward size={32} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Repeat size={24} color="#B3B3B3" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <ListMusic size={20} color="#B3B3B3" />
          <Text style={styles.footerButtonText}>Lyrics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <Share2 size={20} color="#B3B3B3" />
          <Text style={styles.footerButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 8,
  },
  trackInfo: {
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 18,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#4f4f4f',
    borderRadius: 2,
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    backgroundColor: '#1DB954',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 24,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  footerButtonText: {
    color: '#B3B3B3',
    fontSize: 14,
    marginLeft: 8,
  },
});