import { Field, ObjectType } from '@nestjs/graphql';
import { Publication } from '../entities/publication.entity';

@ObjectType()
export class PublicationResponseDto {
  constructor(publication: Publication) {
    this.id = publication.id;
    this.title = publication.title;
    this.doi = publication.doi;
    this.url = publication.url;
    this.authors = publication.authors;
    this.publicationDate = publication.date;
  }

  @Field()
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  doi: string | null;

  @Field({ nullable: true })
  url: string | null;

  @Field(() => [String], { nullable: true })
  authors: string[] | null;

  @Field({ nullable: true })
  publicationDate: Date | null;

  @Field()
  isFavorite: boolean = false;
}
