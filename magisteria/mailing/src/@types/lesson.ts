import { MetaInfo } from './common';

export type Lesson = {
  Id: number,
  Number: number,
  ReadyDate: string,
  State: 'R' | 'D' | 'A',
  ContentType: number,
  Cover: string,
  CoverMeta: MetaInfo,
  URL: string,
  IsAuthRequired: boolean,
  IsSubsRequired: boolean,
  IsFreeInPaidCourse: boolean,
  IsFinished: boolean,
  Name: string,
  ShortDescription: string,
  Duration: number,
  DurationFmt: string,
  AuthorId: number,
  NSub: number,
  NRefBooks: number,
  NBooks: number,
  Lessons: Array<Lesson>,
  Audios: Array<string>,
  Videos: Array<string>
};
