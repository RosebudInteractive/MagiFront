export declare type ImageDbInfo = {
    Id: number;
    ResType: 'P' | null;
    FileName: string;
    ResLanguageId: number | null;
    ShowInGalery: boolean;
    Language: string | null;
    Name: string;
    Description: string;
    AltAttribute: string | null;
    MetaData: string;
    ArtifactText: string | null;
    AuthorText: string | null;
    MuseumText: string | null;
    Descriptor: string | null;
    IsFragment: boolean;
    Status: number;
    IsNew: boolean;
    LinkTypeId: number | null;
};
export declare type MetaData = {
    'mime-type': string;
    path: string;
    content: {
        icon?: string;
        s?: string;
        m?: string;
        l?: string;
        name: string;
        fileId: string;
        size: {
            width: number;
            height: number;
        };
        description: string;
    };
};
export declare type ImageInfo = {
    id: number;
    resType: 'P' | null;
    fileName: string;
    resLanguageId: number | null;
    showInGallery: boolean;
    language: string | null;
    name: string;
    description: string;
    altAttribute: string | null;
    metaData: MetaData;
    artifactText: string | null;
    authorText: string | null;
    museumText: string | null;
    descriptor: string | null;
    isFragment: boolean;
    status: number;
    isNew: boolean;
    linkTypeId: number | null;
};
//# sourceMappingURL=images.d.ts.map