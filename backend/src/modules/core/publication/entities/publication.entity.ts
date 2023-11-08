import { Field, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
  @Column()
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
