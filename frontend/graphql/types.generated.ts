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
  doi?: InputMaybe<Array<Scalars['String']>>;
  exId: Scalars['String'];
  publisher?: InputMaybe<Scalars['String']>;
  source: PublicationSource;
  title: Scalars['String'];
  url?: InputMaybe<Scalars['String']>;
};

export type DescriptorDto = {
  sentences: Array<SentenceDto>;
};

export type JwtDto = {
  __typename?: 'JwtDto';
  accessToken: Scalars['String'];
  expiresIn: Scalars['Int'];
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
  markAsFavorite: Scalars['Boolean'];
  refreshToken: JwtDto;
  register: LoggedIn;
  savePublication: PublicationResponseDto;
  unmarkAsFavorite: Scalars['Boolean'];
};


export type MutationLoginArgs = {
  data: LoginDto;
};


export type MutationMarkAsFavoriteArgs = {
  id: Scalars['String'];
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


export type MutationUnmarkAsFavoriteArgs = {
  id: Scalars['String'];
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

export type PublicationResponseDto = {
  __typename?: 'PublicationResponseDto';
  authors?: Maybe<Array<Scalars['String']>>;
  doi: Array<Scalars['String']>;
  exId: Scalars['String'];
  id: Scalars['String'];
  isFavorite: Scalars['Boolean'];
  publicationDate?: Maybe<Scalars['DateTime']>;
  source: PublicationSource;
  title: Scalars['String'];
  url?: Maybe<Scalars['String']>;
};

export enum PublicationSource {
  Arxiv = 'ARXIV'
}

export type PublicationSourceWithSourceIdDto = {
  exId: Scalars['String'];
  source: PublicationSource;
};

export type PublicationVectorsRequestDto = {
  chunk: Scalars['Int'];
  chunkSize?: InputMaybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  favorites: Array<PublicationResponseDto>;
  newest: PublicationResponseDto;
  oldest: PublicationResponseDto;
  provideVectors: PublicationChunkDto;
  publication: PublicationResponseDto;
  publicationCount: Scalars['Int'];
  publicationsById: Array<PublicationResponseDto>;
  publicationsByQuery: Array<PublicationResponseDto>;
  recommendations: Array<RecommendationResponseDto>;
  searchPublicationBySourceAndSourceId?: Maybe<PublicationResponseDto>;
};


export type QueryNewestArgs = {
  source: PublicationSource;
};


export type QueryOldestArgs = {
  source: PublicationSource;
};


export type QueryProvideVectorsArgs = {
  provideVectors: PublicationVectorsRequestDto;
};


export type QueryPublicationArgs = {
  id: Scalars['String'];
};


export type QueryPublicationCountArgs = {
  source?: InputMaybe<PublicationSource>;
};


export type QueryPublicationsByIdArgs = {
  filter: Scalars['String'];
};


export type QueryPublicationsByQueryArgs = {
  filter: Scalars['String'];
};


export type QuerySearchPublicationBySourceAndSourceIdArgs = {
  publicationSourceAndSourceId: PublicationSourceWithSourceIdDto;
};

export type RecommendationResponseDto = {
  __typename?: 'RecommendationResponseDto';
  createdAt: Scalars['String'];
  id: Scalars['String'];
  publications: Array<PublicationResponseDto>;
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
