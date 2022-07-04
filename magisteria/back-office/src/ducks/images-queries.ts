import type { ImageDbInfo, ImageInfo, MetaData } from '#types/images';
// @ts-ignore
import { checkStatus, parseJSON } from '#common/tools/fetch-tools';

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
  }),
);

export const convertImageInfoToDb = (records: Array<ImageInfo>): Array<ImageDbInfo> => records.map(
  (rec: ImageInfo) => ({
    Id: rec.id,
    ResType: rec.resType,
    FileName: rec.fileName,
    ResLanguageId: rec.resLanguageId,
    ShowInGalery: rec.showInGallery,
    Language: rec.language,
    Name: rec.name,
    Description: rec.description,
    AltAttribute: rec.altAttribute,
    MetaData: JSON.stringify(rec.metaData),
    ArtifactText: rec.artifactText,
    AuthorText: rec.authorText,
    MuseumText: rec.museumText,
    Descriptor: rec.descriptor,
    IsFragment: rec.isFragment,
    Status: rec.status,
    IsNew: rec.isNew,
    LinkTypeId: rec.linkTypeId,
    TimeCr: rec.timeCr,
  }),
);

interface ResultHit {
  Authors: string[];
  Id: number;
  IdArtifact: number | null;
  IsFragment: boolean;
  MetaInfo: MetaData;
  Museums: string[];
  Name: string | null;
  PubDate: string;
  Status: number;
  URL: string;
  type: string;
}

type SearchResult = {
  count: number,
  hits: Array<ResultHit>
};

const convertSearchResult = (data: SearchResult): Array<ImageInfo> => data.hits.map((hit) => ({
  id: hit.Id,
  resType: 'P',
  fileName: '',
  resLanguageId: null,
  showInGallery: true,
  language: null,
  name: hit.Name || '',
  description: '',
  altAttribute: '',
  metaData: { ...hit.MetaInfo },
  artifactText: null,
  authorText: hit.Authors.join(','),
  museumText: hit.Museums.join(','),
  descriptor: null,
  isFragment: hit.IsFragment,
  status: hit.Status,
  isNew: false,
  linkTypeId: null,
  timeCr: hit.PubDate,
}));

export const putImages = (lessonId: number, images: ImageInfo[]) => fetch(`/api/pm/pictures?lessonId=${lessonId}`, {
  method: 'PUT',
  headers: {
    'Content-type': 'application/json',
  },
  body: JSON.stringify(convertImageInfoToDb(images)),
  credentials: 'include',
}).then(checkStatus)
  .then(parseJSON);

export const search = (searchValue: string) => fetch('/api/search', {
  method: 'POST',
  headers: {
    'Content-type': 'application/json',
  },
  body: JSON.stringify({
    index: {
      picture: true,
    },
    // size: 0,
    withCount: true,
    query: searchValue,
  }),
  credentials: 'include',
}).then(checkStatus)
  .then(parseJSON)
  .then((result: any) => convertSearchResult(result));
