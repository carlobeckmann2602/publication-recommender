import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPgVector1716214933492 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector');
    await queryRunner.query('ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE vector(768)');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "hnsw_index" ON embedding USING hnsw (vector vector_l2_ops)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS vector');
    await queryRunner.query('ALTER TABLE "embedding" ALTER COLUMN "vector" TYPE double precision array');
    await queryRunner.query('DROP INDEX IF EXISTS hnsw_index');
  }
}
