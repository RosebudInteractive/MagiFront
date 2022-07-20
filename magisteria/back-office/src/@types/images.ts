export type ImageDbInfo = {
  Id: number,
  ResType: 'P' | null,
  FileName: string,
  ResLanguageId: number | null,
  ShowInGalery: boolean,
  Language: string | null,
  Name: string,
  Description: string | null,
  AltAttribute: string | null,
  MetaData: string,
  ArtifactText: string | null,
  AuthorText: string | null,
  MuseumText: string | null,
  Descriptor: string | null,
  IsFragment: boolean,
  Status: number,
  IsNew: boolean,
  LinkTypeId: number | null,
  TimeCr: string,
};

export interface ImageViewable {
  fileName: string;
  metaData: MetaData;
  description: string | null;
}

export type MetaData = {
  'mime-type': string
  path: string,
  content: {
    icon?: string,
    s?: string,
    m?: string,
    l?: string,
  },
  name: string,
  fileId: string,
  size:{
    width: number,
    height: number
  },
  description: string,
};

export interface ImageInfo extends ImageViewable {
  id: number;
  resType: 'P' | null;
  resLanguageId: number | null;
  showInGallery: boolean;
  language: string | null;
  name: string;
  description: string | null;
  altAttribute: string | null;
  artifactText: string | null;
  authorText: string | null;
  museumText: string | null;
  descriptor: string | null;
  isFragment: boolean;
  status: number;
  isNew: boolean;
  linkTypeId: number | null;
  timeCr: string;
  isModerated: boolean;
}

export type ResultImageMetaData = {
  path: string,
  'mime-type': string,
  size: {
    width: number,
    height: number,
  },
  content: {
    l?: string,
    m?: string,
    s?: string,
  },
  icon: string;
};

export type UploadMetaData = {
  file: string,
  info: {
    content: { s: string, m: string, l: string }
    icon: string
    'mime-type': string,
    name: string,
    path: string,
    size: {
      width: number, height: number
    }
  }
};

interface ResultHit {
  Authors: string[];
  Id: number;
  IdArtifact: number | null;
  IsFragment: boolean;
  MetaInfo: ResultImageMetaData;
  Museums: string[];
  PicName: string;
  PicDescription: string | null;
  ArtifactText: string | null;
  AuthorText: string | null;
  MuseumText: string | null;
  Name: string | null;
  PubDate: string;
  Status: number;
  URL: string;
  type: string;
  _score: number;
  highlight: {
    PicName?: Array<string>;
    PicDescription?: Array<string>;
    ArtifactText?: Array<string>;
    AuthorText?: Array<string>;
    MuseumText?: Array<string>;
  }
}

export type SearchResult = {
  count: number,
  hits: Array<ResultHit>
};

export interface SearchResultItem extends ImageViewable {
  id: number;
  metaData: MetaData;
  name: string;
  description: string | null;
  artifactText: string | null;
  authorText: string | null;
  museumText: string | null;
  pubDate: string;
  status: number;
}
