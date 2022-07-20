import { MetaInfo, ExtLinks } from './common';
import { Author } from './author';
import { Lesson } from './lesson';
import { Book } from './book';
import { Test } from './test';

export type Category = {
  Id: number,
  Name: string,
  URL: string
};

export type Course = {
  Id: number,
  LanguageId: number,
  Cover: string,
  CoverMeta: MetaInfo,
  LandCover?: string | null,
  LandCoverMeta?: MetaInfo | null,
  CoverDescription?: string | null,
  IsLandingPage: boolean,
  OneLesson: boolean,
  Mask: string,
  Color: number,
  Name: string,
  Description: string,
  SnPost?: string | null,
  CourseType: number,
  URL: string,
  VideoIntwLink?: string | null,
  VideoIntroLink?: string | null,
  ShortDescription?: string | null,
  TargetAudience?: string | null,
  Aims?: string | null,
  EstDuration?: number | null,
  IntwD?: number,
  IntwDFmt?: string,
  IntroD?: number,
  IntroDFmt?: string,
  IsSubsRequired: boolean,
  ExtLinks: ExtLinks,
  IsBought: boolean,
  IsPaid: boolean,
  PaidTp?: string | null,
  PaidDate?: string | null,
  IsGift: boolean,
  IsPending: boolean,
  IsSubsFree: boolean,
  ProductId?: number | null,
  Price: number,
  DPrice: number,
  Authors: Array<Author>,
  Categories:Array<Category>,
  Lessons: Array<Lesson>,
  Books: Array<Book>,
  RefBooks: Array<string>,
  ShareCounters: any,
  PageMeta: any,
  Tests: Array<Test>,
  Reviews: Array<any>
};
