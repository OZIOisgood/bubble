import React from 'react';
import { render } from '@testing-library/react-native';

import Profile from './profile';

describe('Profile', () => {
  it('should render successfully', () => {
    const { root } = render(< Profile />);
    expect(root).toBeTruthy();
  });
});
