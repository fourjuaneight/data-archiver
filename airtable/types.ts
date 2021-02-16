export interface StringArray {
  [index: number]: string;
  toLowerCase(): string;
}

export interface IBases {
  Bookmarks: StringArray[];
  Media: StringArray[];
  [key: string]: StringArray[];
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
  tags?: string[];
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
