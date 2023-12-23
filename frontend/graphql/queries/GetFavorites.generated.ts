import * as Types from '../types.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetFavoritesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetFavoritesQuery = { __typename?: 'Query', favorites: Array<{ __typename?: 'PublicationResponseDto', id: string, title: string, source: Types.PublicationSource, doi: Array<string>, url?: string | null, authors?: Array<string> | null, publicationDate?: any | null }> };


export const GetFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFavorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"favorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"doi"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"authors"}},{"kind":"Field","name":{"kind":"Name","value":"publicationDate"}}]}}]}}]} as unknown as DocumentNode<GetFavoritesQuery, GetFavoritesQueryVariables>;