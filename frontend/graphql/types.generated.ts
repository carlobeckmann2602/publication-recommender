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
  refreshToken: JwtDto;
  register: LoggedIn;
};


export type MutationLoginArgs = {
  data: LoginDto;
};


export type MutationRefreshTokenArgs = {
  token: Scalars['String'];
};


export type MutationRegisterArgs = {
  data: RegisterDto;
};

export type PublicationResponseDto = {
  __typename?: 'PublicationResponseDto';
  authors?: Maybe<Array<Scalars['String']>>;
  doi?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  publicationDate?: Maybe<Scalars['String']>;
  sentence?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  url?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  publication: PublicationResponseDto;
  publications: Array<PublicationResponseDto>;
};


export type QueryPublicationArgs = {
  id: Scalars['Float'];
};


export type QueryPublicationsArgs = {
  filter: Scalars['String'];
};

export type RegisterDto = {
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
};
