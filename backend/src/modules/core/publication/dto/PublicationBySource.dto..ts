import { Field, InputType } from '@nestjs/graphql';
import { SourceVo } from '../vo/source.vo';

@InputType()
export class PublicationSourceWithSourceIdDto {
  @Field()
  exId: string;

  @Field(() => SourceVo)
  source: SourceVo;
}
