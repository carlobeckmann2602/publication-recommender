import { Expose, Type } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DescriptorDto } from '../dto/descriptor.dto';
import { DescriptorTransformer } from '../transformers/descriptor.transformer';
import { SourceTransformer } from '../transformers/source.transformer';
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
    enum: SourceVo.getAvailableValues(),
    transformer: new SourceTransformer(),
  })
  @Expose()
  @Type(() => SourceVo)
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
