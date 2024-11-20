import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Publication } from './publication.entity';

@Entity('authors')
export class Author {
  constructor(name: string) {
    this.name = name;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_gin_author', { synchronize: false })
  @Column()
  name: string;

  @ManyToOne(() => Publication, (publication) => publication.authors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'publication_id' })
  publication: Publication;

  @Column({ name: 'publication_id' })
  publicationId: string;
}
