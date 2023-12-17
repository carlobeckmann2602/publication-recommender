import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavoritesTable1701905384269 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE favorites (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            publication_id UUID NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);

    await queryRunner.query(`ALTER TABLE favorites 
        ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE favorites
        ADD FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE favorites
        ADD UNIQUE ("user_id", "publication_id")`);

    await queryRunner.query(`
      CREATE INDEX ON favorites(user_id);
      CREATE INDEX ON favorites(publication_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table favorites`);
  }
}
