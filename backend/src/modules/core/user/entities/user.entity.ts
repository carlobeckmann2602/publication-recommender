import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectId,
  Index,
  Unique,
} from 'typeorm';

@ObjectType()
@Entity()
@Index(['email'], { unique: true })
@Unique(['email'])
export class User {
  @Field(() => ID)
  @ObjectIdColumn()
  _id: ObjectId;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column()
  isActive: boolean;
}
