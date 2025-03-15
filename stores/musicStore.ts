import { create } from 'zustand';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
}

interface MusicStore {
  tracks: Track[];
  playlists: any[];
  isLoading: boolean;
  error: string | null;
  fetchTracks: () => Promise<void>;
  searchTracks: (searchQuery: string) => Promise<Track[]>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  tracks: [],
  playlists: [],
  isLoading: false,
  error: null,

  fetchTracks: async () => {
    try {
      set({ isLoading: true, error: null });
      const tracksRef = collection(db, 'tracks');
      const q = query(tracksRef, orderBy('title'), limit(50));
      const tracksSnapshot = await getDocs(q);
      
      if (tracksSnapshot.empty) {
        set({ 
          tracks: [], 
          isLoading: false,
          error: 'No tracks found. Please add some tracks to your collection.'
        });
        return;
      }

      const tracksPromises = tracksSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        try {
          // Get the download URL for the audio file
          const audioRef = ref(storage, data.audioPath);
          const audioUrl = await getDownloadURL(audioRef);
          
          // Get the download URL for the artwork
          const artworkRef = ref(storage, data.artworkPath);
          const artworkUrl = await getDownloadURL(artworkRef);

          return {
            id: doc.id,
            title: data.title,
            artist: data.artist,
            artwork: artworkUrl,
            url: audioUrl,
          };
        } catch (error) {
          console.error(`Error loading track ${doc.id}:`, error);
          return null;
        }
      });

      const tracks = (await Promise.all(tracksPromises)).filter((track): track is Track => track !== null);
      set({ tracks, isLoading: false });
    } catch (error) {
      console.error('Error fetching tracks:', error);
      set({ 
        error: 'Failed to load tracks. Please check your internet connection and try again.',
        isLoading: false 
      });
    }
  },

  searchTracks: async (searchQuery: string) => {
    try {
      const tracksRef = collection(db, 'tracks');
      const q = query(
        tracksRef,
        where('title', '>=', searchQuery.toLowerCase()),
        where('title', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const tracksPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        try {
          const audioRef = ref(storage, data.audioPath);
          const artworkRef = ref(storage, data.artworkPath);
          
          const [audioUrl, artworkUrl] = await Promise.all([
            getDownloadURL(audioRef),
            getDownloadURL(artworkRef),
          ]);

          return {
            id: doc.id,
            title: data.title,
            artist: data.artist,
            artwork: artworkUrl,
            url: audioUrl,
          };
        } catch (error) {
          console.error(`Error loading search result ${doc.id}:`, error);
          return null;
        }
      });

      const results = (await Promise.all(tracksPromises)).filter((track): track is Track => track !== null);
      return results;
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  },
}));