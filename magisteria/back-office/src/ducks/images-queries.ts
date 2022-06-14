import type { ImageDbInfo, ImageInfo } from '#types/images';

// eslint-disable-next-line import/prefer-default-export
export const convertDbImageInfo = (records: Array<ImageDbInfo>): Array<ImageInfo> => records.map((rec: ImageDbInfo) => ({
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
}));
