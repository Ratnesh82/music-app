import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Download, MoveVertical as MoreVertical } from 'lucide-react-native';
import { usePlayerStore } from '@/stores/playerStore';

const LIBRARY_ITEMS = [
  {
    id: '1',
    type: 'playlist',
    title: 'My Favorites',
    description: 'Your favorite tracks',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    tracks: [
      {
        id: '1',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        url: 'https://example.com/song.mp3',
        isDownloaded: true,
      },
      {
        id: '2',
        title: 'Stay',
        artist: 'Kid Laroi & Justin Bieber',
        artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        url: 'https://example.com/song2.mp3',
        isDownloaded: false,
      },
    ],
  },
];

export default function LibraryScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const playTrack = usePlayerStore((state) => state.playTrack);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'downloaded', label: 'Downloaded' },
    { id: 'playlists', label: 'Playlists' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <View style={styles.filters}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={LIBRARY_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playlistContainer}>
            <View style={styles.playlistHeader}>
              <Image source={{ uri: item.coverUrl }} style={styles.playlistCover} />
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistTitle}>{item.title}</Text>
                <Text style={styles.playlistDescription}>{item.description}</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MoreVertical size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={item.tracks}
              keyExtractor={(track) => track.id}
              renderItem={({ item: track }) => (
                <TouchableOpacity
                  style={styles.track}
                  onPress={() => playTrack(track)}>
                  <Image source={{ uri: track.artwork }} style={styles.trackArtwork} />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.artistName}>{track.artist}</Text>
                  </View>
                  {track.isDownloaded ? (
                    <Download size={20} color="#1DB954" />
                  ) : (
                    <TouchableOpacity>
                      <Download size={20} color="#B3B3B3" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#282828',
  },
  filterButtonActive: {
    backgroundColor: '#1DB954',
  },
  filterText: {
    color: '#B3B3B3',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  playlistContainer: {
    padding: 16,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playlistCover: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  playlistDescription: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 4,
  },
  moreButton: {
    padding: 8,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  trackArtwork: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  artistName: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 2,
  },
});