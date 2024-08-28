import * as React from 'react';
import { render } from '@testing-library/react-native';

import Shell from './Shell';

test('renders correctly', () => {
  const { getByTestId } = render(<Shell />);
  expect(getByTestId('heading')).toHaveTextContent('Welcome');
});
