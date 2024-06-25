import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import {
  BottomNavigation,
  Button,
  Card,
  IconButton,
  PaperProvider,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import recommendationsDtoMock, { TrackDto } from './recommendationsDtoMock';
import theme from './theme';
import { Audio } from 'expo-av';

const TRACK_VOLUME = 0.1;

type SoundInstance = {
  sound: Audio.Sound;
  isPlaying: boolean;
  volume: number;
};

class SoundService {
  private static instance: SoundService;
  private sounds: { [id: string]: SoundInstance } = {};
  private lastPausedId: string | null = null;

  private constructor() {}

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  public async playSound(
    id: string,
    url: string,
    volume: number
  ): Promise<void> {
    if (this.sounds[id]) {
      await this.sounds[id].sound.setVolumeAsync(volume);
      await this.sounds[id].sound.playAsync();
      this.sounds[id].isPlaying = true;
      this.sounds[id].volume = volume;
    } else {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.setVolumeAsync(volume);
      this.sounds[id] = { sound, isPlaying: true, volume };
      await sound.playAsync();
    }
  }

  public async pauseSound(id: string): Promise<void> {
    if (this.sounds[id] && this.sounds[id].isPlaying) {
      await this.sounds[id].sound.pauseAsync();
      this.sounds[id].isPlaying = false;
      this.lastPausedId = id;
    }
  }

  public async pauseAllSounds(): Promise<void> {
    const pausePromises = Object.values(this.sounds).map(
      async (soundInstance) => {
        if (soundInstance.isPlaying) {
          await soundInstance.sound.pauseAsync();
          soundInstance.isPlaying = false;
          this.lastPausedId =
            Object.keys(this.sounds).find(
              (key) => this.sounds[key] === soundInstance
            ) || null;
        }
      }
    );
    await Promise.all(pausePromises);
  }

  public async stopAllSounds(): Promise<void> {
    const stopPromises = Object.values(this.sounds).map(
      async (soundInstance) => {
        await soundInstance.sound.stopAsync();
        soundInstance.isPlaying = false;
      }
    );
    await Promise.all(stopPromises);
    this.lastPausedId = null;
  }

  public async unpauseLastSound(): Promise<void> {
    if (this.lastPausedId && this.sounds[this.lastPausedId]) {
      await this.sounds[this.lastPausedId].sound.playAsync();
      this.sounds[this.lastPausedId].isPlaying = true;
    }
  }
}

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
  isFirstCard,
  shouldPlay,
  track,
  onLikePress,
  onDislikePress,
}: {
  isFirstCard: boolean;
  shouldPlay: boolean;
  track: TrackDto;
  onDislikePress: () => void;
  onLikePress: () => void;
}) => {
  const { colors } = useTheme();
  const [isFirstPlay, setIsFirstPlay] = useState(true);
  const [isPaused, setIsPaused] = useState(isFirstCard);

  const soundService = SoundService.getInstance();

  useEffect(() => {
    if (!isFirstCard && shouldPlay) {
      setIsFirstPlay(false);

      soundService.pauseAllSounds();
      soundService.playSound(
        track.id,
        track.preview_url as string,
        TRACK_VOLUME
      );
    }
  }, [isFirstCard, shouldPlay]);

  const onPausePress = () => {
    setIsPaused(!isPaused);

    const shouldPause = !isPaused;

    if (isFirstCard) {
      if (shouldPause) {
        // pause song
        soundService.pauseSound(track.id);
      } else {
        if (isFirstPlay) {
          setIsFirstPlay(false);

          // play song
          soundService.playSound(
            track.id,
            track.preview_url as string,
            TRACK_VOLUME
          );
        } else {
          // unpause song
          soundService.unpauseLastSound();
        }
      }
    } else {
      if (shouldPause) {
        // pause song
        soundService.pauseSound(track.id);
      } else {
        // unpause song
        soundService.unpauseLastSound();
      }
    }
  };

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
      <TouchableOpacity
        key="trackCardStyle-container"
        style={trackCardStyle.container}
        onPress={onPausePress}
      >
        <View style={trackCardStyle.imageContainer}>
          <Image
            style={{
              ...trackCardStyle.image,
              opacity: isPaused ? 0.5 : 1,
            }}
            source={{ uri: track.album.images[0].url }}
            blurRadius={isPaused ? 5 : 0}
          />

          {
            // Show play icon when paused
            isPaused && (
              <IconButton
                icon="pause"
                size={75}
                style={{
                  position: 'absolute',
                }}
              />
            )
          }
        </View>

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
      </TouchableOpacity>
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

const RecommendationsRoute = ({
  isActiveRoute,
}: {
  isActiveRoute: boolean;
}) => {
  const swiperRef = useRef<Swiper<TrackDto>>(null);
  const { colors } = useTheme();
  const [index, setIndex] = React.useState(0);

  const tracks = recommendationsDtoMock.tracks.filter(
    (track) => track.preview_url
  );

  const onCardSwiped = () => {
    setIndex(index + 1);
  };

  const soundService = SoundService.getInstance();

  useEffect(() => {
    // Unpause last sound when entering the route
    if (isActiveRoute) {
      soundService.unpauseLastSound();
    }

    // Pause all sounds when leaving the route
    if (!isActiveRoute) {
      soundService.pauseAllSounds();
    }
  }, [isActiveRoute]);

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
            isFirstCard={cardIndex === 0}
            shouldPlay={cardIndex === index}
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
  const [index, setIndex] = React.useState(1);

  const bottomNavigationRoutes = [
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
  ];

  const [routes] = React.useState(bottomNavigationRoutes);

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'profile':
        return <ProfileRoute />;
      case 'recommendations':
        return (
          <RecommendationsRoute
            isActiveRoute={
              index === routes.findIndex((r) => r.key === 'recommendations')
            }
          />
        );
      case 'playlists':
        return <PlaylistsRoute />;
      default:
        return null;
    }
  };

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
