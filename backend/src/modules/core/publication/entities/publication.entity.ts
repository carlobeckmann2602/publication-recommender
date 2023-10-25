import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity('publications')
export class Publication {
  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
  }

  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false })
  title: string;

  @Field()
  @Column({ nullable: true })
  publisher: string;

  @Field(() => [String])
  @Column('varchar', { array: true })
  authors: string[] = [];

  @Field()
  @Column({ nullable: true })
  date: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
