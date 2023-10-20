import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { UsersService } from './user/services/users.service';
import { UserResolver } from './user/resolver/user.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserResolver],
  controllers: [],
  exports: [TypeOrmModule],
})
export class CoreModule {}
