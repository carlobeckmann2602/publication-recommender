import { registerEnumType } from '@nestjs/graphql';

export enum SearchStrategyVo {
  QUERY = 'query',
  ID = 'id',
}
registerEnumType(SearchStrategyVo, { name: 'SearchStrategy' });
