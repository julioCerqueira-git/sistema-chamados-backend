import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropComments1769965000000 implements MigrationInterface {
  name = 'DropComments1769965000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"`);
    await queryRunner.query(`DROP TABLE "comments"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "text" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "ticketId" uuid,
        "userId" uuid,
        CONSTRAINT "PK_8bf68bc960f2b691818790ad19d" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"
      FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }
}
