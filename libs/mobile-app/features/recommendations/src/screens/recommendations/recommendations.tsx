import React, { useEffect, useRef } from 'react';

import { SafeAreaView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useTheme } from 'react-native-paper';
import recommendationsDtoMock, { TrackDto } from './recommendationsDtoMock';
import { TrackCard } from '../../components/track-card/track-card';
import { SoundService } from '../../services/sound-service/sound-service';

export interface RecommendationsScreenProps {
  isActiveRoute: boolean;
}

export const RecommendationsScreen = ({
  isActiveRoute,
}: RecommendationsScreenProps) => {
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
