import {
  PlaylistsRoute,
  PlaylistsScreen,
} from '@buble/mobile-app/features/playlists';
import {
  ProfileRoute,
  ProfileScreen,
} from '@buble/mobile-app/features/profile';
import {
  RecommendationsRoute,
  RecommendationsScreen,
} from '@buble/mobile-app/features/recommendations';
import React from 'react';
import { BottomNavigation, PaperProvider } from 'react-native-paper';
import { BaseRoute } from 'react-native-paper/lib/typescript/components/BottomNavigation/BottomNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import theme from './theme';

const routes: BaseRoute[] = [
  ProfileRoute,
  RecommendationsRoute,
  PlaylistsRoute,
];

export const Shell = () => {
  const [index, setIndex] = React.useState(1);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'profile':
                return <ProfileScreen />;
              case 'recommendations':
                return (
                  <RecommendationsScreen
                    isActiveRoute={
                      index ===
                      routes.findIndex((r) => r.key === 'recommendations')
                    }
                  />
                );
              case 'playlists':
                return <PlaylistsScreen />;
              default:
                return null;
            }
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
};
