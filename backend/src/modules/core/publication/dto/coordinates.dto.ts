import { Field, Float, InputType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize } from 'class-validator';

@InputType()
export class CoordinatesDto {
  @Field()
  id: string;

  @Field(() => [Float])
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  coordinate: number[];
}
