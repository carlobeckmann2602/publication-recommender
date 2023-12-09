import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncCodeWithDb1702081897462 implements MigrationInterface {
  name = 'SyncCodeWithDb1702081897462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "publications" DROP CONSTRAINT "ex_id_source"`);
    await queryRunner.query(`ALTER TYPE "public"."publication_source" RENAME TO "publication_source_old"`);
    await queryRunner.query(`CREATE TYPE "public"."publications_source_enum" AS ENUM('arxiv')`);
    await queryRunner.query(
      `ALTER TABLE "publications" ALTER COLUMN "source" TYPE "public"."publications_source_enum" USING "source"::"text"::"public"."publications_source_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."publication_source_old"`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "authors" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "authors" SET DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "created_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "favorites" ALTER COLUMN "created_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "favorites" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "publications" ADD CONSTRAINT "ex_id_source" UNIQUE ("ex_id", "source")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "publications" DROP CONSTRAINT "ex_id_source"`);
    await queryRunner.query(`ALTER TABLE "favorites" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "favorites" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "authors" SET DEFAULT ARRAY[]`);
    await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "authors" DROP NOT NULL`);
    await queryRunner.query(`CREATE TYPE "public"."publication_source_old" AS ENUM('arxiv')`);
    await queryRunner.query(
      `ALTER TABLE "publications" ALTER COLUMN "source" TYPE "public"."publication_source_old" USING "source"::"text"::"public"."publication_source_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."publications_source_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."publication_source_old" RENAME TO "publication_source"`);
    await queryRunner.query(`ALTER TABLE "publications" ADD CONSTRAINT "ex_id_source" UNIQUE ("ex_id", "source")`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
  }
}
