import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1718970651118 implements MigrationInterface {
    name = 'Migrations1718970651118'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_gin_authors"`);
        await queryRunner.query(`CREATE TABLE "authors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "publication_id" uuid NOT NULL, CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_gin_author" ON "authors" USING GIN (to_tsvector('english', "name"))`);
        await queryRunner.query(`ALTER TABLE "publications" DROP COLUMN "authors"`);
        await queryRunner.query(`ALTER TABLE "authors" ADD CONSTRAINT "FK_66b14e842ba5666bea30b21ba61" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authors" DROP CONSTRAINT "FK_66b14e842ba5666bea30b21ba61"`);
        await queryRunner.query(`ALTER TABLE "publications" ADD "authors" character varying array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."idx_gin_author"`);
        await queryRunner.query(`DROP TABLE "authors"`);
        await queryRunner.query(`CREATE INDEX "idx_gin_authors" ON "publications" ("authors") `);
    }

}
