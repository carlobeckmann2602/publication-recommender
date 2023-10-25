import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePublicationsTable1698184468440 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE publications (
        id UUID PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        authors VARCHAR(100) ARRAY DEFAULT ARRAY[]::VARCHAR[],
        publisher VARCHAR(500),
        date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);

    await queryRunner.query(
      `CREATE INDEX idx_gin_authors ON publications USING GIN(authors);
      CREATE INDEX idx_title ON publications(title);
      CREATE INDEX idx_publisher ON publications(publisher);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE publications`);
  }
}
