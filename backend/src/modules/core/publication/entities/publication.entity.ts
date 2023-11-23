import { Field, ObjectType } from '@nestjs/graphql';
import { Expose, Type } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DescriptorDto } from '../dto/descriptor.dto';
import { DescriptorTransformer } from '../transformers/descriptor.transformer';

@ObjectType()
@Entity('publications')
export class Publication {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'ex_id', unique: true })
  @Expose()
  exId: string;

  @Field()
  @Column()
  @Expose()
  title: string;

  @Column({ nullable: true })
  @Expose()
  doi: string | null;

  @Column({ nullable: true })
  @Expose()
  url: string | null;

  @Field()
  @Column({ nullable: true })
  @Expose()
  publisher: string;

  @Field(() => [String])
  @Column('varchar', { array: true })
  @Expose()
  authors: string[] = [];

  @Field()
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
