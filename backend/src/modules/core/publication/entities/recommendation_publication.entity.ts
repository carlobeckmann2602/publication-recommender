import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Publication } from './publication.entity';
import { Recommendation } from './recommendation.entity';

@Entity('recommendation_publications')
export class RecommendationPublication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recommendation_id' })
  @Index('recommendation_publications_recommendation_id_idx')
  recommendationId: string;

  @OneToOne(() => Recommendation, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'recommendation_id',
    foreignKeyConstraintName: 'recommendation_publications_recommendation_id_fkey',
  })
  recommendation: Recommendation;

  @ManyToOne(() => Publication)
  @JoinColumn({ name: 'publication_id', foreignKeyConstraintName: 'recommendation_publications_publication_id_idx' })
  publication: Publication;
}
