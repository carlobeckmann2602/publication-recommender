import * as Types from '../types.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddToPublicationGroupMutationVariables = Types.Exact<{
  publicationgroup_id: Types.Scalars['String'];
  publication_ids: Array<Types.Scalars['String']> | Types.Scalars['String'];
}>;


export type AddToPublicationGroupMutation = { __typename?: 'Mutation', addToPublicationGroup: { __typename?: 'SuccessResponseDto', success: boolean } };


export const AddToPublicationGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddToPublicationGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publicationgroup_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publication_ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addToPublicationGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"publicationgroup_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publicationgroup_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"publication_ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publication_ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<AddToPublicationGroupMutation, AddToPublicationGroupMutationVariables>;