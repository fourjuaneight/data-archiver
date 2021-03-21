export interface StringArray {
  [index: number]: string;
  toLowerCase(): string;
}

export interface List {
  [key: string]: IRecords[];
}

export interface Bases {
  Bookmarks: IList;
  Media: IList;
  [key: string]: IList;
}

export interface Endpoints {
  Bookmarks?: string;
  Media?: string;
  [key: string]: string | undefined;
}

export interface KyOptions {
  headers: {
    Authorization: string;
    "Content-Type": string;
  };
}

export interface BookmarksFields {
  creator: string;
  title: string;
  url: string;
  tags: string[];
}
export interface MediaFields {
  author?: string;
  creator?: string;
  director?: string;
  genre: string;
  studio?: string;
  title: string;
}
export interface RecordsFields {
  category?: string[];
  company?: string;
  end?: string | null;
  name?: string;
  position?: string;
  rss?: string;
  stack?: string[];
  start?: string;
  title?: string;
  url?: string;
}

export type Fields = BookmarksFields | MediaFields | RecordsFields;

export interface Records {
  id: string;
  fields: IFields;
  createdTime: string;
}

export interface AirtableResp {
  records: IRecords[];
  offset: string;
}
