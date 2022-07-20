export type Discount = {
  value: number,
  descr: string
};

export interface MetaInfo {
  'mime-type': string,
  path: string,
  content: {
    s?: string,
    m?: string,
    l?: string
  },
  name: string,
  size: {
    width: number,
    height: number
  },
  icon?: string
}

export type ExtSources = 'www.ozon.ru' | 'www.labirint.ru' | 'ru.bookmate.com'

export type ExtLinks = {
  [key in ExtSources]: string;
};
