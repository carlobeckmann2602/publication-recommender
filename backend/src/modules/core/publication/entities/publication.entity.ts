import { Exclude, Expose, Type } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DescriptorDto } from '../dto/descriptor.dto';
import { DescriptorTransformer } from '../transformers/descriptor.transformer';
import { SourceVo } from '../vo/source.vo';

@Entity('publications')
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
  @Expose()
  title: string;

  @Column({ nullable: true })
  @Expose()
  doi: string | null;

  @Column({ nullable: true })
  @Expose()
  url: string | null;

  @Column({ nullable: true })
  @Expose()
  publisher: string | null;

  @Column({ nullable: true })
  @Expose()
  abstract: string | null;

  @Column('varchar', { array: true })
  @Expose()
  authors: string[] = [];

  @Column({ nullable: true })
  @Expose()
  date: Date;

  @Column({ type: 'jsonb', transformer: new DescriptorTransformer() })
  @Expose()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @Exclude()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
