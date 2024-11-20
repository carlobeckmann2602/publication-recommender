import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1717609718363 implements MigrationInterface {
  name = 'Migrations1717609718363';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "idx_gin_title" ON "publications" USING GIN (to_tsvector('english', title));;
                            CREATE INDEX "idx_doi" ON "publications" ("doi") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_doi"`);
  }
}
