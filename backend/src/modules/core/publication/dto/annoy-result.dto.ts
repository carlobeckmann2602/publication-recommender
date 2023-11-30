import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class AnnoyResultDto {
  @ValidateNested()
  @IsNotEmpty() // see https://github.com/typestack/class-validator/issues/897
  @Type(() => AnnoySingleResult)
  matches: AnnoySingleResult[];
}

export class AnnoySingleResult {
  @IsString()
  id: string;
}
