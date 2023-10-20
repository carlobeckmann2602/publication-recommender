import { Resolver, Args, Query, Mutation, ID } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { CreateUser } from '../dto/create-user.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(@Inject(UsersService) private userService: UsersService) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Query(() => User)
  async user(@Args('id') id: string): Promise<User> {
    return await this.userService.findOne(id);
  }

  @Mutation(() => User)
  async create(@Args('data') dto: CreateUser): Promise<User> {
    return await this.userService.create(dto);
  }

  @Mutation(() => ID)
  async remove(@Args('id') id: string): Promise<string> {
    await this.userService.remove(id);
    return id;
  }
}
