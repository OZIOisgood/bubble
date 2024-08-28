import React from 'react';
import { render } from '@testing-library/react-native';

import Shell from './shell';

describe('Shell', () => {
  it('should render successfully', () => {
    const { root } = render(< Shell />);
    expect(root).toBeTruthy();
  });
});
