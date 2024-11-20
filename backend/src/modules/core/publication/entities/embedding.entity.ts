import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Publication } from './publication.entity';

@Entity()
export class Embedding {
  constructor(text: string, vector: string) {
    this.text = text;
    this.vector = vector;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column('vector')
  @Index('hnsw_index')
  vector: string;

  @ManyToOne(() => Publication, (publication) => publication.embeddings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'publication_id' })
  publication: Publication;

  @Column({ name: 'publication_id' })
  publicationId: string;
}
