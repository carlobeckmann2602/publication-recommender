import * as Types from '../types.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type RemoveFromPublicationGroupMutationVariables = Types.Exact<{
  publicationgroup_id: Types.Scalars['String'];
  publication_id: Types.Scalars['String'];
}>;


export type RemoveFromPublicationGroupMutation = { __typename?: 'Mutation', removeFromPublicationGroup: { __typename?: 'SuccessResponseDto', success: boolean } };


export const RemoveFromPublicationGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveFromPublicationGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publicationgroup_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publication_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFromPublicationGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"publicationgroup_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publicationgroup_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"publication_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publication_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<RemoveFromPublicationGroupMutation, RemoveFromPublicationGroupMutationVariables>;