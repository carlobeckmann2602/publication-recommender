import { registerEnumType } from '@nestjs/graphql';

export enum SourceVo {
  ARXIV = 'arxiv',
}

registerEnumType(SourceVo, { name: 'PublicationSource' });
