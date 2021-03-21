export interface StringArray {
  [index: number]: string;
  toLowerCase(): string;
}

export interface IList {
  [key: string]: IRecords[];
}

export interface IBases {
  Bookmarks: IList;
  Media: IList;
  [key: string]: IList;
}

export interface IEndpoints {
  Bookmarks?: string;
  Media?: string;
  [key: string]: string | undefined;
}

export interface IKyOptions {
  headers: {
    Authorization: string;
    "Content-Type": string;
  };
}

export interface IFields {
  author?: string;
  category?: string;
  creator?: string;
  developer?: string;
  director?: string;
  genre?: string;
  ios?: string;
  rss?: string;
  title: string;
  url?: string;
  tags?: string | string[];
}

export interface IRecords {
  id: string;
  fields: IFields;
  createdTime: string;
}

export interface IAirtableResp {
  records: IRecords[];
  offset: string;
}
