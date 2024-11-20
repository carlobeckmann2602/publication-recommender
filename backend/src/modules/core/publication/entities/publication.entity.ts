import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { SourceVo } from '../vo/source.vo';
import { Embedding } from './embedding.entity';
import { PublicationGroup } from './publicationgroup.entity';
import { Recommendation } from './recommendation.entity';
import { Author } from './author.entity';

@Entity('publications')
@Unique('ex_id_source', ['exId', 'source'])
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'ex_id' })
  @Expose()
  exId: string;

  @Column({
    type: 'enum',
    enum: SourceVo,
  })
  @Expose()
  source: SourceVo;

  @Column()
  @Index('idx_title')
  @Index('idx_gin_title', { synchronize: false })
  @Expose()
  title: string;

  @Column('varchar', { array: true, default: [] })
  @Index('idx_doi')
  @Expose()
  doi: string[] = [];

  @Column({ nullable: true })
  @Expose()
  url: string | null;

  @Column({ nullable: true })
  @Index('idx_publisher')
  @Expose()
  publisher: string | null;

  @Column({ nullable: true })
  @Expose()
  abstract: string | null;

  @OneToMany(() => Author, (author) => author.publication, { cascade: true })
  authors: Author[];

  @Column({ nullable: true, type: Date })
  @Expose()
  date: Date;

  @Column('float', { nullable: true, array: true, default: [] })
  @Expose()
  coordinate: number[] | null;

  @ManyToMany(() => Recommendation, (recommendation) => recommendation.publications)
  recommendations: Recommendation[];

  @ManyToMany(() => PublicationGroup, (publicationgroup) => publicationgroup.publications)
  publicationgroups: PublicationGroup[];

  @OneToMany(() => Embedding, (embedding) => embedding.publication, { cascade: true })
  embeddings: Embedding[];

  @Exclude()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
