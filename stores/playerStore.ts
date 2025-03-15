import { create } from 'zustand';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import debounce from 'lodash/debounce';

interface PlayerState {
  sound: Audio.Sound | null;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  currentTrack: Track | null;
  playbackPosition: number;
  duration: number;
  isBuffering: boolean;
  downloadedTracks: Record<string, string>;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: (track: Track) => Promise<void>;
  resumeTrack: (track: Track) => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  downloadTrack: (track: Track) => Promise<void>;
  isTrackDownloaded: (trackId: string) => boolean;
  cleanup: () => Promise<void>;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork: string;
}

const MUSIC_DIRECTORY = `${FileSystem.documentDirectory}music/`;

// Configure audio mode once at startup for native platforms
if (Platform.OS !== 'web') {
  Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    shouldDuckAndroid: false,
  }).catch(console.error);
}

// Debounce the play function to prevent rapid consecutive calls
const debouncedPlay = debounce(
  async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
    } catch (error) {
      console.error('Playback error:', error);
    }
  },
  300,
  { leading: true, trailing: false }
);

export const usePlayerStore = create<PlayerState>((set, get) => ({
  sound: null,
  audioElement: null,
  isPlaying: false,
  currentTrack: null,
  playbackPosition: 0,
  duration: 0,
  isBuffering: false,
  downloadedTracks: {},

  cleanup: async () => {
    const { sound, audioElement } = get();
    
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
    
    if (audioElement) {
      try {
        audioElement.pause();
        audioElement.removeEventListener('timeupdate', () => {});
        audioElement.removeEventListener('waiting', () => {});
        audioElement.removeEventListener('playing', () => {});
        audioElement.removeEventListener('ended', () => {});
        audioElement.removeEventListener('error', () => {});
        audioElement.removeEventListener('pause', () => {});
        audioElement.src = '';
        audioElement.load();
      } catch (error) {
        console.error('Error cleaning up audio element:', error);
      }
    }
    
    set({
      sound: null,
      audioElement: null,
      isPlaying: false,
      currentTrack: null,
      playbackPosition: 0,
      duration: 0,
      isBuffering: false
    });
  },

  playTrack: async (track: Track) => {
    try {
      // First, clean up any existing playback
      await get().cleanup();

      if (Platform.OS === 'web') {
        const audio = new Audio();
        
        // Store the timeupdate handler so we can properly remove it later
        const handleTimeUpdate = () => {
          set({
            playbackPosition: audio.currentTime * 1000,
            duration: audio.duration * 1000,
            isPlaying: !audio.paused && !audio.ended,
          });
        };

        const handleWaiting = () => set({ isBuffering: true });
        const handlePlaying = () => set({ isBuffering: false });
        const handleEnded = () => get().cleanup();
        const handleError = (e: ErrorEvent) => {
          console.error('Audio error:', e.currentTarget);
          get().cleanup();
        };
        const handlePause = () => set({ isPlaying: false });

        // Set up event listeners before setting the source
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('pause', handlePause);

        // Load and play the audio
        audio.src = track.url;
        audio.preload = 'auto';

        try {
          await debouncedPlay(audio);
          
          set({
            audioElement: audio,
            currentTrack: track,
            isPlaying: true,
            sound: null,
          });
        } catch (playError) {
          console.error('Play error:', playError);
          await get().cleanup();
        }
      } else {
        // Native implementation using Expo AV
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.url },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              set({
                playbackPosition: status.positionMillis,
                duration: status.durationMillis || 0,
                isBuffering: status.isBuffering,
                isPlaying: status.isPlaying,
              });
            }
          },
          true // Download first on native platforms
        );

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              get().cleanup();
            }
          }
        });

        set({
          sound,
          currentTrack: track,
          isPlaying: true,
          audioElement: null,
        });
      }
    } catch (error) {
      console.error('Error playing track:', error);
      await get().cleanup();
    }
  },

  pauseTrack: async () => {
    const { sound, audioElement } = get();
    try {
      if (Platform.OS === 'web' && audioElement) {
        audioElement.pause();
        set({ isPlaying: false });
      } else if (sound) {
        await sound.pauseAsync();
        set({ isPlaying: false });
      }
    } catch (error) {
      console.error('Error pausing track:', error);
    }
  },

  resumeTrack: async () => {
    const { sound, audioElement } = get();
    try {
      if (Platform.OS === 'web' && audioElement) {
        await debouncedPlay(audioElement);
        set({ isPlaying: true });
      } else if (sound) {
        await sound.playAsync();
        set({ isPlaying: true });
      }
    } catch (error) {
      console.error('Error resuming track:', error);
      set({ isPlaying: false });
    }
  },

  seekTo: async (position: number) => {
    const { sound, audioElement } = get();
    try {
      if (Platform.OS === 'web' && audioElement) {
        audioElement.currentTime = position / 1000;
      } else if (sound) {
        await sound.setPositionAsync(position);
      }
    } catch (error) {
      console.error('Error seeking track:', error);
    }
  },

  downloadTrack: async (track: Track) => {
    if (Platform.OS === 'web') {
      set((state) => ({
        downloadedTracks: {
          ...state.downloadedTracks,
          [track.id]: track.url,
        },
      }));
      return;
    }

    try {
      await FileSystem.makeDirectoryAsync(MUSIC_DIRECTORY, { intermediates: true });
      const fileUri = `${MUSIC_DIRECTORY}${track.id}.mp3`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        track.url,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          // You can add progress tracking here
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      set((state) => ({
        downloadedTracks: {
          ...state.downloadedTracks,
          [track.id]: uri,
        },
      }));
    } catch (error) {
      console.error('Error downloading track:', error);
    }
  },

  isTrackDownloaded: (trackId: string) => {
    const { downloadedTracks } = get();
    return !!downloadedTracks[trackId];
  },
}));