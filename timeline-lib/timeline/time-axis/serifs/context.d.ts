import React from 'react';
import { Theme } from '../../../types/theme';
export interface ISerif {
    x: number;
    y: number;
    zoom: number;
    theme: Theme | null;
}
declare const SerifsContext: React.Context<ISerif>;
export default SerifsContext;
