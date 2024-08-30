import { useEffect, useState } from 'react';

import { Audio } from 'expo-av';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, useTheme } from 'react-native-paper';
import { TrackDto } from '../../screens/recommendations/recommendationsDtoMock';
import { SoundService } from '../../services/sound-service/sound-service';

const TRACK_VOLUME = 0.1;

export interface TrackCardProps {
  isFirstCard: boolean;
  shouldPlay: boolean;
  track: TrackDto;
  onDislikePress: () => void;
  onLikePress: () => void;
}

export const TrackCard = ({
  isFirstCard,
  shouldPlay,
  track,
  onLikePress,
  onDislikePress,
}: TrackCardProps) => {
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
                size={100}
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
    width: 250,
    height: 250,
    borderRadius: 125,
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
