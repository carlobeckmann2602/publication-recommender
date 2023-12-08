import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Favorite } from '../../publication/entities/favorite.entity';

@ObjectType()
@Entity('users')
export class User {
  constructor(id: string, email: string, password: string, name: string) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
  }

  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field()
  @Column()
  name: string;

  @OneToMany(() => Favorite, (favorite) => favorite.user, {
    cascade: true,
  })
  @JoinColumn({ name: 'user_id' })
  favorites: Favorite[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
