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

export type CreatePublicationDto = {
  abstract?: InputMaybe<Scalars['String']>;
  authors?: InputMaybe<Array<Scalars['String']>>;
  date?: InputMaybe<Scalars['DateTime']>;
  descriptor: DescriptorDto;
  doi?: InputMaybe<Scalars['String']>;
  exId: Scalars['String'];
  publisher?: InputMaybe<Scalars['String']>;
  source: Scalars['String'];
  title: Scalars['String'];
  url?: InputMaybe<Scalars['String']>;
};

export type DescriptorDto = {
  sentences: Array<SentenceDto>;
};

export type JwtDto = {
  __typename?: 'JwtDto';
  accessToken: Scalars['String'];
  refreshToken: Scalars['String'];
};

export type LoggedIn = {
  __typename?: 'LoggedIn';
  jwt: JwtDto;
  user: User;
};

export type LoginDto = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  login: LoggedIn;
  provideVectors: PublicationChunkDto;
  refreshToken: JwtDto;
  register: LoggedIn;
  savePublication: Publication;
};


export type MutationLoginArgs = {
  data: LoginDto;
};


export type MutationProvideVectorsArgs = {
  provideVectors: PublicationVectorsRequestDto;
};


export type MutationRefreshTokenArgs = {
  token: Scalars['String'];
};


export type MutationRegisterArgs = {
  data: RegisterDto;
};


export type MutationSavePublicationArgs = {
  createPublication: CreatePublicationDto;
};

export type Publication = {
  __typename?: 'Publication';
  abstract: Scalars['String'];
  authors: Array<Scalars['String']>;
  date: Scalars['DateTime'];
  id: Scalars['String'];
  publisher: Scalars['String'];
  title: Scalars['String'];
};

export type PublicationChunkDataDto = {
  __typename?: 'PublicationChunkDataDto';
  id: Scalars['String'];
  vectors: Array<Array<Scalars['Float']>>;
};

export type PublicationChunkDto = {
  __typename?: 'PublicationChunkDto';
  chunk: Scalars['Int'];
  data: Array<PublicationChunkDataDto>;
};

export type PublicationVectorsRequestDto = {
  chunk: Scalars['Int'];
  chunkSize?: InputMaybe<Scalars['Int']>;
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

export type RegisterDto = {
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
};

export type SentenceDto = {
  value: Scalars['String'];
  vector: Array<Scalars['Float']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
};
