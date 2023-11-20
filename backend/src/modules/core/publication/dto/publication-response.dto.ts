import { Field, ObjectType } from '@nestjs/graphql';
import { Publication } from '../entities/publication.entity';

@ObjectType()
export class PublicationResponseDto {
  constructor(publication: Publication, sentenceIndex?: number) {
    this.id = publication.id;
    this.title = publication.title;
    this.doi = publication.doi;
    this.url = publication.url;
    this.authors = publication.authors;
    this.publicationDate = publication.publicationDate ? publication.publicationDate.toString() : null;
    this.sentence = sentenceIndex ? publication.vectorData[sentenceIndex].sentence : null;
  }

  @Field()
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  doi: string | null;

  @Field({ nullable: true })
  url: string | null;

  @Field((type) => [String], { nullable: true })
  authors: string[] | null;

  @Field({ nullable: true })
  publicationDate: string | null;

  @Field({ nullable: true })
  sentence: string | null;
}
