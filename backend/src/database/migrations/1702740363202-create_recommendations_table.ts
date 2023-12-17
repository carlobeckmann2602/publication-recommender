import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecommendationsTable1702740363202 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE recommendations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP NOT NULL DEFAULT now(),
            updated_at TIMESTAMP NOT NULL DEFAULT now()
      )`);

    await queryRunner.query(`
        CREATE TABLE recommendation_publications (
            recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
            publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
            PRIMARY KEY (recommendation_id, publication_id)
      )`);

    await queryRunner.query(`
      CREATE INDEX ON recommendations(user_id);
      CREATE INDEX ON recommendation_publications(recommendation_id);
      CREATE INDEX ON recommendation_publications(publication_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table recommendations`);
    await queryRunner.query(`drop table recommendation_publications`);
  }
}
