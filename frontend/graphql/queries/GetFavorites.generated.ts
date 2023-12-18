import * as Types from '../types.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetFavoritesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetFavoritesQuery = { __typename?: 'Query', favorites: Array<{ __typename?: 'PublicationResponseDto', id: string }> };


export const GetFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFavorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"favorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetFavoritesQuery, GetFavoritesQueryVariables>;