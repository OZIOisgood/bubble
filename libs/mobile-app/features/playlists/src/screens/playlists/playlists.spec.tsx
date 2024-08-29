import React from 'react';
import { render } from '@testing-library/react-native';

import Playlists from './playlists';

describe('Playlists', () => {
  it('should render successfully', () => {
    const { root } = render(< Playlists />);
    expect(root).toBeTruthy();
  });
});
