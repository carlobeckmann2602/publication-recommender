import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixDateType1702169192130 implements MigrationInterface {
  name = 'FixDateType1702169192130';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "date"`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "date" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "date"`);
    await queryRunner.query(`ALTER TABLE "publications" ADD "date" date`);
  }
}
