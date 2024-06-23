import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import {
  BottomNavigation,
  Button,
  Card,
  PaperProvider,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import recommendationsDtoMock, { TrackDto } from './recommendationsDtoMock';
import theme from './theme';
import { Audio } from 'expo-av';

const TRACK_VOLUME = 0.1;

type UseSoundReturnType = {
  play: () => Promise<void>;
  volume: (value: number) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  isPlaying: boolean;
  isLoading: boolean;
  error: Error | null;
};

const useSound = (url: string): UseSoundReturnType => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSound = async () => {
      try {
        setIsLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: false }
        );
        setSound(sound);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [url]);

  const play = useCallback(async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }, [sound]);

  const volume = useCallback(
    async (value: number) => {
      if (sound) {
        await sound.setVolumeAsync(value);
      }
    },
    [sound]
  );

  const pause = useCallback(async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  }, [sound]);

  const stop = useCallback(async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  }, [sound]);

  return {
    play,
    volume,
    pause,
    stop,
    isPlaying,
    isLoading,
    error,
  };
};

const ProfileRoute = () => (
  <SafeAreaView>
    <Text>Profile</Text>
  </SafeAreaView>
);

const PlaylistsRoute = () => (
  <SafeAreaView>
    <Text>PlaylistsRoute</Text>
  </SafeAreaView>
);

const TrackCard = ({
  isPlay,
  track,
  onLikePress,
  onDislikePress,
}: {
  isPlay: boolean;
  track: TrackDto;
  onDislikePress: () => void;
  onLikePress: () => void;
}) => {
  const { colors } = useTheme();
  const { play, volume, pause, stop, isPlaying, isLoading, error } = useSound(
    track.preview_url as string
  );

  // Automatically play the sound when the component mounts
  useEffect(() => {
    if (isPlay && !isLoading && !isPlaying && !error) {
      play();
      volume(TRACK_VOLUME);
    }
    if (!isPlay && (isPlaying || isLoading || error)) {
      stop();
    }
  }, [isPlay, isLoading, isPlaying, error, play]);

  return (
    <Card
      style={{
        flex: 1,
        backgroundColor: colors.elevation.level2,
      }}
      contentStyle={{
        flex: 1,
      }}
    >
      <View key="trackCardStyle-container" style={trackCardStyle.container}>
        <View style={trackCardStyle.imageContainer}>
          <Image
            style={trackCardStyle.image}
            source={{ uri: track.album.images[0].url }}
          />
        </View>

        {/* <View style={trackCardStyle.buttonContainer}>
          <Button
            icon="play"
            mode="contained"
            textColor={colors.primary}
            style={{
              flex: 1,
              margin: 5,
              backgroundColor: colors.secondaryContainer,
            }}
            onPress={play}
          >
            Play
          </Button>
        </View> */}

        <View style={trackCardStyle.buttonContainer}>
          <Button
            icon="thumb-down"
            mode="contained"
            textColor={colors.primary}
            style={{
              flex: 1,
              margin: 5,
              backgroundColor: colors.secondaryContainer,
            }}
            onPress={onDislikePress}
          >
            Nope
          </Button>

          <Button
            icon="heart"
            mode="contained"
            textColor={colors.primary}
            style={{
              flex: 1,
              margin: 5,
              backgroundColor: colors.secondaryContainer,
            }}
            onPress={onLikePress}
          >
            Like
          </Button>
        </View>
      </View>
    </Card>
  );
};

const trackCardStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    margin: 5,
  },
});

const RecommendationsRoute = () => {
  const swiperRef = useRef<Swiper<TrackDto>>(null);
  const { colors } = useTheme();
  const [index, setIndex] = React.useState(0);

  const tracks = recommendationsDtoMock.tracks.filter(
    (track) => track.preview_url
  );

  const onCardSwiped = () => {
    setIndex(index + 1);
  };

  const overlayLabels = {
    left: {
      title: 'NOPE',
      style: {
        label: {
          backgroundColor: colors.background,
          color: colors.errorContainer,
          borderWidth: 1,
          fontSize: 24,
        },
        wrapper: {
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          marginTop: 20,
          marginLeft: -20,
        },
      },
    },
    right: {
      title: 'LIKE',
      style: {
        label: {
          backgroundColor: colors.background,
          color: colors.primary,
          borderWidth: 1,
          fontSize: 24,
        },
        wrapper: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          marginTop: 20,
          marginLeft: 20,
        },
      },
    },
  };

  return (
    <SafeAreaView>
      <Swiper
        ref={swiperRef}
        marginBottom={50}
        infinite
        verticalSwipe={false}
        stackSize={tracks.length}
        cards={tracks}
        cardIndex={index}
        onSwiped={onCardSwiped}
        renderCard={(cardData: TrackDto, cardIndex: number) => (
          <TrackCard
            isPlay={cardIndex === index}
            track={cardData}
            onDislikePress={() => {
              swiperRef.current?.swipeLeft();
            }}
            onLikePress={() => swiperRef.current?.swipeRight()}
          />
        )}
        overlayOpacityHorizontalThreshold={1}
        overlayLabels={overlayLabels}
      />
    </SafeAreaView>
  );
};

const App = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'profile',
      title: 'Profile',
      focusedIcon: 'account',
      unfocusedIcon: 'account-outline',
    },
    {
      key: 'recommendations',
      title: 'Recommendations',
      focusedIcon: 'star',
      unfocusedIcon: 'star-outline',
    },
    {
      key: 'playlists',
      title: 'Playlists',
      focusedIcon: 'playlist-music',
      unfocusedIcon: 'playlist-music-outline',
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    profile: ProfileRoute,
    recommendations: RecommendationsRoute,
    playlists: PlaylistsRoute,
  });

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
