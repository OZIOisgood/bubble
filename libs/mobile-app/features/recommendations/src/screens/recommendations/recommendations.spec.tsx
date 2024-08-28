import React from 'react';
import { render } from '@testing-library/react-native';

import Recommendations from './recommendations';

describe('Recommendations', () => {
  it('should render successfully', () => {
    const { root } = render(< Recommendations />);
    expect(root).toBeTruthy();
  });
});
