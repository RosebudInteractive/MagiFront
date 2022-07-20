import { ExtLinks, MetaInfo } from './common';

export type BookAuthor = {
  'Id': number,
  'Tp': number,
  'TpView': number,
  'FirstName': string,
  'LastName': string,
  'URL': string
};

export type Book = {
  'Id': number,
  'Name': string,
  'Description': string,
  'CourseId': number,
  'OtherAuthors': string | null,
  'OtherCAuthors': string | null,
  'Cover': string,
  'CoverMeta': MetaInfo,
  'ExtLinks': ExtLinks,
  'Authors': Array<BookAuthor>
};
