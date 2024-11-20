import { Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Publication } from './publication.entity';

@Entity('publicationgroup')
export class PublicationGroup {
  constructor(id: string, userId: string, name: string, color: string) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.color = color;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ nullable: true })
  color: string | null;

  @Column({ name: 'user_id' })
  @Index('publicationgroups_user_id_idx')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Publication, (publication) => publication.publicationgroups)
  @JoinTable({
    name: 'publicationgroup_publications',
    joinColumn: { name: 'publicationgroup_id' },
    inverseJoinColumn: { name: 'publication_id' },
  })
  publications: Publication[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
