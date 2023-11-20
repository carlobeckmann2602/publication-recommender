import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePublication1700514870338 implements MigrationInterface {
    name = 'UpdatePublication1700514870338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_gin_authors"`);
        await queryRunner.query(`DROP INDEX "public"."idx_title"`);
        await queryRunner.query(`DROP INDEX "public"."idx_publisher"`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "publisher"`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "doi" character varying`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "url" character varying`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "publicationDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "vectorData" json NOT NULL`);
        await queryRunner.query(`ALTER TABLE "publications" DROP CONSTRAINT "publications_pkey"`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "publications" ADD CONSTRAINT "PK_2c4e732b044e09139d2f1065fae" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "authors" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "publications" ALTER COLUMN "authors" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "publications" DROP CONSTRAINT "PK_2c4e732b044e09139d2f1065fae"`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "publications" ADD CONSTRAINT "publications_pkey" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "vectorData"`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "publicationDate"`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "url"`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "doi"`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "date" date`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "publisher" character varying`);
        await queryRunner.query(`CREATE INDEX "idx_publisher" ON "publications" ("publisher") `);
        await queryRunner.query(`CREATE INDEX "idx_title" ON "publications" ("title") `);
        await queryRunner.query(`CREATE INDEX "idx_gin_authors" ON "publications" ("authors") `);
    }

}
