import type {
  ImageDbInfo,
  ImageInfo,
  MetaData,
  ResultImageMetaData,
  SearchResult,
  SearchResultItem,
  UploadMetaData,
} from '#types/images';

export const convertDbImageInfo = (records: Array<ImageDbInfo>): Array<ImageInfo> => records.map(
  (rec: ImageDbInfo) => ({
    id: rec.Id,
    resType: rec.ResType,
    fileName: rec.FileName,
    resLanguageId: rec.ResLanguageId,
    showInGallery: rec.ShowInGalery,
    language: rec.Language,
    name: rec.Name,
    description: rec.Description,
    altAttribute: rec.AltAttribute,
    metaData: JSON.parse(rec.MetaData),
    artifactText: rec.ArtifactText,
    authorText: rec.AuthorText,
    museumText: rec.MuseumText,
    descriptor: rec.Descriptor,
    isFragment: rec.IsFragment,
    status: rec.Status,
    isNew: rec.IsNew,
    linkTypeId: rec.LinkTypeId,
    timeCr: rec.TimeCr,
    isModerated: rec.Status === 1,
  }),
);

export const convertImageInfoToDb = (record: ImageInfo): ImageDbInfo => ({
  Id: record.id,
  ResType: record.resType,
  FileName: record.fileName,
  ResLanguageId: record.resLanguageId,
  ShowInGalery: record.showInGallery,
  Language: record.language,
  Name: record.name,
  Description: record.description,
  AltAttribute: record.altAttribute,
  MetaData: JSON.stringify(record.metaData),
  ArtifactText: record.artifactText,
  AuthorText: record.authorText,
  MuseumText: record.museumText,
  Descriptor: record.descriptor,
  IsFragment: record.isFragment,
  Status: record.isModerated ? 1 : 2,
  IsNew: record.isNew,
  LinkTypeId: record.linkTypeId,
  TimeCr: record.timeCr,
});

const relativePath = (from: string, to: RegExp): string => (from ? from.replace(to, '') : from);

export const convertResultImageMetaDataToMetaData = (value: ResultImageMetaData): MetaData => ({
  'mime-type': value['mime-type'],
  path: value.path,
  content: { ...value.content, icon: value.icon },
  name: '',
  fileId: '',
  size: { ...value.size },
  description: '',
});

export const convertSearchResult = (data: SearchResult)
: Array<SearchResultItem> => data.hits.map((hit) => ({
  id: hit.Id,
  metaData: convertResultImageMetaDataToMetaData(hit.MetaInfo),
  name: hit.PicName,
  description: hit.PicDescription,
  artifactText: hit.ArtifactText,
  authorText: hit.AuthorText,
  museumText: hit.MuseumText,
  pubDate: hit.PubDate,
  fileName: hit.URL,
  status: hit.Status,
}));

const convertToRelativePath = (meta: MetaData) => {
  const content: any = {};

  Object.entries(meta.content).forEach(([size, path]) => {
    content[size] = relativePath(path, /^.+\/data\/\d{4}\/\d{2}\//gm);
  });

  return {
    ...meta,
    path: relativePath(meta.path, /^.+\/data\//gm),
    content,
  };
};

export const convertSearchResultToImageInfo = (value: SearchResultItem): ImageInfo => ({
  id: value.id,
  resType: 'P',
  resLanguageId: null,
  showInGallery: true,
  language: null,
  name: value.name,
  metaData: convertToRelativePath(value.metaData),
  fileName: value.fileName,
  description: value.description,
  altAttribute: null,
  artifactText: value.artifactText,
  authorText: value.authorText,
  museumText: value.museumText,
  descriptor: null,
  isFragment: false,
  status: value.status,
  isNew: false,
  linkTypeId: null,
  timeCr: value.pubDate,
  isModerated: value.status === 1,
});

export const createImageInfoFromUploadMetaData = (meta: UploadMetaData): ImageInfo => ({
  id: -1,
  resType: 'P',
  resLanguageId: null,
  showInGallery: true,
  language: null,
  name: '',
  fileName: meta.file,
  metaData: {
    'mime-type': meta.info['mime-type'],
    path: meta.info.path,
    name: meta.info.name,
    content: { ...meta.info.content, icon: meta.info.icon },
    size: meta.info.size,
    description: '',
    fileId: '',
  },
  description: null,
  altAttribute: null,
  artifactText: null,
  authorText: null,
  museumText: null,
  descriptor: null,
  isFragment: false,
  status: 2,
  isNew: true,
  linkTypeId: null,
  timeCr: '',
  isModerated: false,
});