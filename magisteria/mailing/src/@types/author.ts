import { MetaInfo } from './common';

export type Author = {
  Id: number,
  FirstName: string,
  LastName: string,
  Description: string,
  ShortDescription?: string | null,
  Occupation?: string | null,
  Employment?: string | null,
  Portrait: string,
  PortraitMeta: MetaInfo,
  URL: string
};
