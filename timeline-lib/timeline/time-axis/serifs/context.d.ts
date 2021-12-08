import React from 'react';
import { Theme } from '../../../types/theme';
export interface ISerif {
    needCorrectionOnBC: boolean;
    isDeprecatedBrowser: boolean;
    zoom: number;
    theme: Theme | null;
}
declare const SerifsContext: React.Context<ISerif>;
export default SerifsContext;
