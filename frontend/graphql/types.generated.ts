export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type Publication = {
  __typename?: 'Publication';
  authors: Array<Scalars['String']>;
  date: Scalars['DateTime'];
  id: Scalars['String'];
  publisher: Scalars['String'];
  title: Scalars['String'];
};

export type PublicationsQueryDto = {
  publisher?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  publication: Publication;
  publications: Array<Publication>;
};


export type QueryPublicationArgs = {
  id: Scalars['String'];
};


export type QueryPublicationsArgs = {
  filter?: InputMaybe<PublicationsQueryDto>;
};
