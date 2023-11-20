import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type VectorData = {
  sentence: string;
  vector: number[];
};

@Entity('publications')
export class Publication {
  constructor(
    title: string,
    doi: string | null,
    url: string | null,
    authors: string[] | null,
    publicationDate: Date | null,
    vectorData: VectorData[],
  ) {
    this.title = title;
    this.doi = doi;
    this.url = url;
    this.authors = authors;
    this.publicationDate = publicationDate;
    this.vectorData = vectorData;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  doi: string | null;

  @Column({ nullable: true })
  url: string | null;

  @Column('varchar', { nullable: true, array: true })
  authors: string[] | null;

  @Column({ nullable: true })
  publicationDate: Date | null;

  @Column({ type: 'json' })
  vectorData: VectorData[];
}
