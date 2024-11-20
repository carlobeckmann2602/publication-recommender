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

export type AuthorCreateDto = {
  name: Scalars['String'];
};

export type CoordinatesDto = {
  coordinate: Array<Scalars['Float']>;
  id: Scalars['String'];
};

export type CreatePublicationDto = {
  abstract?: InputMaybe<Scalars['String']>;
  authorsCreateDtos?: InputMaybe<Array<AuthorCreateDto>>;
  date?: InputMaybe<Scalars['DateTime']>;
  doi?: InputMaybe<Array<Scalars['String']>>;
  embeddingsCreateDtos: Array<EmbeddingCreateDto>;
  exId: Scalars['String'];
  publisher?: InputMaybe<Scalars['String']>;
  source: PublicationSource;
  title: Scalars['String'];
  url?: InputMaybe<Scalars['String']>;
};

export type EmbeddingCreateDto = {
  text: Scalars['String'];
  vector: Array<Scalars['Float']>;
};

export type EmbeddingResponseDto = {
  __typename?: 'EmbeddingResponseDto';
  id: Scalars['String'];
  text: Scalars['String'];
  vector: Array<Scalars['Float']>;
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

export type MaximumAmountOfSentencesForPublicationResponseDto = {
  __typename?: 'MaximumAmountOfSentencesForPublicationResponseDto';
  amount: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addToPublicationGroup: SuccessResponseDto;
  createNewRecommendation: RecommendationResponseDto;
  createPublicationGroup: PublicationGroupResponseDto;
  deleteProfile: Scalars['Boolean'];
  deletePublicationGroup: SuccessResponseDto;
  login: LoggedIn;
  markAsFavorite: Scalars['Boolean'];
  refreshToken: JwtDto;
  register: LoggedIn;
  removeFromPublicationGroup: SuccessResponseDto;
  savePublication: PublicationResponseDto;
  savePublicationsCoordinates: Array<PublicationResponseDto>;
  unmarkAsFavorite: Scalars['Boolean'];
  updateProfile: User;
  updatePublicationGroup: SuccessResponseDto;
};


export type MutationAddToPublicationGroupArgs = {
  publication_ids: Array<Scalars['String']>;
  publicationgroup_id: Scalars['String'];
};


export type MutationCreateNewRecommendationArgs = {
  createNewRecommendationInput?: InputMaybe<RecommendationCreateDto>;
};


export type MutationCreatePublicationGroupArgs = {
  data: PublicationGroupCreateDto;
};


export type MutationDeletePublicationGroupArgs = {
  id: Scalars['String'];
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


export type MutationRemoveFromPublicationGroupArgs = {
  publication_id: Scalars['String'];
  publicationgroup_id: Scalars['String'];
};


export type MutationSavePublicationArgs = {
  createPublication: CreatePublicationDto;
};


export type MutationSavePublicationsCoordinatesArgs = {
  savePublicationsCoordinatesDto: SavePublicationsCoordiantesDto;
};


export type MutationUnmarkAsFavoriteArgs = {
  id: Scalars['String'];
};


export type MutationUpdateProfileArgs = {
  data: UpdateUserDto;
};


export type MutationUpdatePublicationGroupArgs = {
  data: PublicationGroupDto;
};

export type NearestNeighborRequestDto = {
  amount: Scalars['Int'];
  vector: Array<Scalars['Float']>;
};

export type NearestNeighborsResponseDto = {
  __typename?: 'NearestNeighborsResponseDto';
  distance: Scalars['Float'];
  embeddingId: Scalars['String'];
  publication: PublicationResponseDto;
};

export type PublicationChunkRequestDto = {
  chunk: Scalars['Int'];
  chunkSize?: InputMaybe<Scalars['Int']>;
};

export type PublicationGroupCreateDto = {
  color: Scalars['String'];
  name: Scalars['String'];
};

export type PublicationGroupDto = {
  color?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
};

export type PublicationGroupResponseDto = {
  __typename?: 'PublicationGroupResponseDto';
  color: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  publications: Array<PublicationResponseDto>;
};

export type PublicationResponseDto = {
  __typename?: 'PublicationResponseDto';
  abstract?: Maybe<Scalars['String']>;
  authors?: Maybe<Array<Scalars['String']>>;
  coordinate?: Maybe<Array<Scalars['Float']>>;
  doi: Array<Scalars['String']>;
  embeddings: Array<EmbeddingResponseDto>;
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

export type PublicationsSearchByIdResponseDto = {
  __typename?: 'PublicationsSearchByIdResponseDto';
  searchCoordinate?: Maybe<Array<Scalars['Float']>>;
  similarPublications: Array<PublicationResponseDto>;
};

export type PublicationsSearchDto = {
  amountPerPage?: Scalars['Int'];
  filters?: InputMaybe<SearchFilters>;
  page?: Scalars['Int'];
  searchInput: Scalars['String'];
  sortStrategy?: SortStrategy;
};

export type PublicationsSearchResponseDto = {
  __typename?: 'PublicationsSearchResponseDto';
  matchingPublications: Array<PublicationResponseDto>;
  searchCoordinate?: Maybe<Array<Scalars['Float']>>;
  searchTerm: Scalars['String'];
  similarPublications: Array<PublicationResponseDto>;
};

export type Query = {
  __typename?: 'Query';
  favorites: Array<PublicationResponseDto>;
  getNearestNeighbors: Array<NearestNeighborsResponseDto>;
  maximumAmountOfSentencesForPublication: MaximumAmountOfSentencesForPublicationResponseDto;
  newest: PublicationResponseDto;
  oldest: PublicationResponseDto;
  profile: User;
  providePublicationChunk: Array<PublicationResponseDto>;
  publication: PublicationResponseDto;
  publicationCount: Scalars['Int'];
  publicationGroup: PublicationGroupResponseDto;
  publicationGroups: Array<PublicationGroupResponseDto>;
  publications: PublicationsSearchResponseDto;
  recommendations: Array<RecommendationResponseDto>;
  searchPublicationBySourceAndSourceId?: Maybe<PublicationResponseDto>;
  similarPublicationsForPublicationWithId: PublicationsSearchByIdResponseDto;
};


export type QueryGetNearestNeighborsArgs = {
  nearestNeighborRequestDto: NearestNeighborRequestDto;
};


export type QueryNewestArgs = {
  source: PublicationSource;
};


export type QueryOldestArgs = {
  source: PublicationSource;
};


export type QueryProvidePublicationChunkArgs = {
  providePublicationChunk: PublicationChunkRequestDto;
};


export type QueryPublicationArgs = {
  id: Scalars['String'];
};


export type QueryPublicationCountArgs = {
  source?: InputMaybe<PublicationSource>;
};


export type QueryPublicationGroupArgs = {
  id: Scalars['String'];
};


export type QueryPublicationsArgs = {
  publicationsSearchDto: PublicationsSearchDto;
};


export type QuerySearchPublicationBySourceAndSourceIdArgs = {
  publicationSourceAndSourceId: PublicationSourceWithSourceIdDto;
};


export type QuerySimilarPublicationsForPublicationWithIdArgs = {
  similarPublicationsForPublicationWithIdDto: SimilarPublicationsForPublicationWithIdDto;
};

export type RecommendationCreateDto = {
  amount?: Scalars['Int'];
  exlude?: Array<Scalars['String']>;
  group: Array<Scalars['String']>;
};

export type RecommendationResponseDto = {
  __typename?: 'RecommendationResponseDto';
  createdAt: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  publications: Array<PublicationResponseDto>;
};

export type RegisterDto = {
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
};

export type SavePublicationsCoordiantesDto = {
  coordinates: Array<CoordinatesDto>;
};

export type SearchFilters = {
  author?: InputMaybe<Scalars['String']>;
  doi?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  years?: InputMaybe<Array<Scalars['String']>>;
};

export type SimilarPublicationsForPublicationWithIdDto = {
  amountPerPage?: Scalars['Int'];
  filters?: InputMaybe<SearchFilters>;
  id: Scalars['String'];
  page?: Scalars['Int'];
  sortStrategy?: SortStrategy;
};

export enum SortStrategy {
  AToZ = 'A_TO_Z',
  Newest = 'NEWEST',
  Oldest = 'OLDEST',
  Relevance = 'RELEVANCE',
  ZToA = 'Z_TO_A'
}

export type SuccessResponseDto = {
  __typename?: 'SuccessResponseDto';
  success: Scalars['Boolean'];
};

export type UpdateUserDto = {
  email?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  oldPassword?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
};
