import { registerEnumType } from '@nestjs/graphql';

export enum SortStrategyVo {
  RELEVANCE = 'relevance',
  NEWEST = 'newest',
  OLDEST = 'oldest',
  A_TO_Z = 'aToZ',
  Z_TO_A = 'zToA',
}
registerEnumType(SortStrategyVo, { name: 'SortStrategy' });
