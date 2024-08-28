import { RecommendationsScreen } from '@buble/mobile-app/features/recommendations';
import React from 'react';
import { BottomNavigation, PaperProvider, Text } from 'react-native-paper';
import { BaseRoute } from 'react-native-paper/lib/typescript/components/BottomNavigation/BottomNavigation';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import theme from './theme';
import { PlaylistsScreen } from '@buble/mobile-app/features/playlists';

const ProfileScreen = () => (
  <SafeAreaView>
    <Text>Profile</Text>
  </SafeAreaView>
);

const routes: BaseRoute[] = [
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
