import { Field, InputType } from '@nestjs/graphql';
import { CoordinatesDto } from './coordinates.dto';

@InputType()
export class SavePublicationsCoordiantesDto {
  @Field(() => [CoordinatesDto])
  coordinates: CoordinatesDto[];
}
