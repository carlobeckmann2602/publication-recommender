import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePublicationsTable1700631916114 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE "publications"`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "ex_id" character varying unique NOT NULL`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "doi" character varying`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "url" character varying`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "descriptor" jsonb NOT NULL`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "ex_id"`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "descriptor"`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "doi"`);
  }
}
