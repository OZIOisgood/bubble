import React from 'react';
import { render } from '@testing-library/react-native';

import TrackCard from './track-card';

describe('TrackCard', () => {
  it('should render successfully', () => {
    const { root } = render(< TrackCard />);
    expect(root).toBeTruthy();
  });
});
