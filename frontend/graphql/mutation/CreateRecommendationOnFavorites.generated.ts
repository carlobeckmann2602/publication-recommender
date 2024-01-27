import * as Types from '../types.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CreateRecommendationOnFavoritesMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type CreateRecommendationOnFavoritesMutation = { __typename?: 'Mutation', createNewRecommendation: { __typename?: 'RecommendationResponseDto', id?: string | null, createdAt: any, publications: Array<{ __typename?: 'PublicationResponseDto', id: string, title: string, authors?: Array<string> | null, publicationDate?: any | null, url?: string | null, doi: Array<string>, exId: string, abstract?: string | null }> } };


export const CreateRecommendationOnFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRecommendationOnFavorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createNewRecommendation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"publications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"authors"}},{"kind":"Field","name":{"kind":"Name","value":"publicationDate"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"doi"}},{"kind":"Field","name":{"kind":"Name","value":"exId"}},{"kind":"Field","name":{"kind":"Name","value":"abstract"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateRecommendationOnFavoritesMutation, CreateRecommendationOnFavoritesMutationVariables>;