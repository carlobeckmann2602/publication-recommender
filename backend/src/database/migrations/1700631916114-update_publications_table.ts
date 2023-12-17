import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePublicationsTable1700631916114 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE "publications"`);
    await queryRunner.query(`CREATE TYPE publication_source AS ENUM ('arxiv')`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "ex_id" VARCHAR NOT NULL`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "source" publication_source NOT NULL`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "doi" VARCHAR`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "url" VARCHAR`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "abstract" VARCHAR`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "descriptor" jsonb NOT NULL`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
    await queryRunner.query(`ALTER TABLE "publications" ADD CONSTRAINT ex_id_source UNIQUE ("ex_id", "source");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "publications" DROP CONSTRAINT ex_id_source`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "ex_id"`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "source"`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "descriptor"`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "doi"`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "abstract"`);
    await queryRunner.query(`DROP TYPE publication_source`);
  }
}
