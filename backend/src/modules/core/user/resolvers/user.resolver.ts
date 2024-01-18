import { InternalServerErrorException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UnprocessableEntityException } from '@nestjs/common/exceptions/unprocessable-entity.exception';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Mutation } from '@nestjs/graphql/dist/decorators/mutation.decorator';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async profile(@AuthUser() user: User): Promise<User> {
    try {
      return user;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProfile(
    @AuthUser() user: User,
    @Args('data', {
      type: () => UpdateUserDto,
      nullable: false,
    })
    data: UpdateUserDto,
  ): Promise<User> {
    try {
      return await this.userService.updateUser(user, data);
    } catch (e) {
      throw new UnprocessableEntityException(null, e.message);
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteProfile(@AuthUser() user: User): Promise<boolean> {
    try {
      await this.userService.deleteUser(user);
      return true;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
