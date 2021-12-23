import React from 'react';
import { Theme } from '../../../types/theme';

export interface ISerif {
  needCorrectionOnBC: boolean,
  isDeprecatedBrowser: boolean,
  zoom: number,
  theme: Theme | null,
}

const SerifsContext = React.createContext<ISerif>({
  needCorrectionOnBC: false,
  isDeprecatedBrowser: false,
  zoom: 1,
  theme: null,
});

export default SerifsContext;
