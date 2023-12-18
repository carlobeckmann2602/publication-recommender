import { Exclude, Expose, Type } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { DescriptorDto } from '../dto/descriptor.dto';
import { DescriptorTransformer } from '../transformers/descriptor.transformer';
import { SourceVo } from '../vo/source.vo';
import { Recommendation } from './recommendation.entity';

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
  @Expose()
  title: string;

  @Column('varchar', { array: true, default: [] })
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

  @Column('varchar', { array: true, default: [] })
  @Index('idx_gin_authors', { synchronize: false })
  @Expose()
  authors: string[] = [];

  @Column({ nullable: true, type: Date })
  @Expose()
  date: Date;

  @Column({ type: 'jsonb', transformer: new DescriptorTransformer() })
  @Expose()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ManyToMany(() => Recommendation, (recommendation) => recommendation.publications)
  @JoinTable({
    name: 'recommendation_publications',
    joinColumn: { name: 'publication_id' },
    inverseJoinColumn: { name: 'recommendation_id' },
  })
  recommendations: Recommendation[];

  @Exclude()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
