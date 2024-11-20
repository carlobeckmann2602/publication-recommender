import { Field, ObjectType } from '@nestjs/graphql';
import { PublicationGroup } from '../entities/publicationgroup.entity';
import { PublicationResponseDto } from './publication-response.dto';

@ObjectType()
export class PublicationGroupResponseDto {
  constructor(publicationgroup: PublicationGroup) {
    this.id = publicationgroup.id;
    this.name = publicationgroup.name;
    this.color = publicationgroup.color;

    if (publicationgroup.publications) {
      this.publications = publicationgroup.publications.map((publication) => new PublicationResponseDto(publication));
    }
  }

  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  color: string;

  @Field(() => [PublicationResponseDto])
  publications: PublicationResponseDto[];
}
