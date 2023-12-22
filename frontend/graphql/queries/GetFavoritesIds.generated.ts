import * as Types from '../types.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetFavoritesIdsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetFavoritesIdsQuery = { __typename?: 'Query', favorites: Array<{ __typename?: 'PublicationResponseDto', id: string }> };


export const GetFavoritesIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFavoritesIds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"favorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetFavoritesIdsQuery, GetFavoritesIdsQueryVariables>;