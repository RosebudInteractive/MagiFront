export type ReferenceItem = {
  id: number,
  name: string,
  url: string,
  number: number
};

export declare class References {
    public courses?: ReferenceItem[];
    public lessons?: ReferenceItem[];
}
