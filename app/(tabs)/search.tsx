import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search as SearchIcon } from 'lucide-react-native';
import { usePlayerStore } from '@/stores/playerStore';
import { useMusicStore } from '@/stores/musicStore';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const searchTracks = useMusicStore((state) => state.searchTracks);

  useEffect(() => {
    const performSearch = async () => {
      if (query.trim()) {
        setIsSearching(true);
        const results = await searchTracks(query);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#B3B3B3" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Songs, artists, or albums"
            placeholderTextColor="#B3B3B3"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => playTrack(item)}>
              <Image source={{ uri: item.artwork }} style={styles.artwork} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.artistName}>{item.artist}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            query.trim() ? (
              <Text style={styles.noResults}>No results found</Text>
            ) : null
          )}
        />
      )}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  artwork: {
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
  artistName: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 4,
  },
  noResults: {
    color: '#B3B3B3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
});