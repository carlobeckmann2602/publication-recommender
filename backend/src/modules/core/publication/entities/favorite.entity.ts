import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Publication } from './publication.entity';

@Entity('favorites')
@Unique('favorites_user_id_publication_id_key', ['userId', 'publicationId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index('favorites_user_id_idx')
  userId: string;

  @Column({ name: 'publication_id' })
  @Index('favorites_publication_id_idx')
  publicationId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'favorites_user_id_fkey' })
  user: User;

  @ManyToOne(() => Publication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'publication_id', foreignKeyConstraintName: 'favorites_publication_id_fkey' })
  publication: Publication;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
