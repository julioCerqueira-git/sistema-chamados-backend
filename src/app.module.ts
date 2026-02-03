import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
  import './utils/env';
import * as path from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST as string,
      port: parseInt(process.env.DB_PORT as string, 10),
      username: process.env.DB_USER as string,
      password: process.env.DB_PASS as string,
      database: process.env.DB_NAME as string,
      entities: [
        path.join(__dirname, '**/*.entity.{js,ts}'),
        path.join(process.cwd(), 'src/**/*.entity.{js,ts}'),
      ],
      migrations: [path.join(__dirname, 'migrations/**/*.{js,ts}')],
      migrationsTableName: 'migrations',
      synchronize: false,
      logging: false,
    }),
    UsersModule,
    AuthModule,
    TicketsModule,
  ],
})
export class AppModule {}
