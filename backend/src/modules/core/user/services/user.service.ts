import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { EmailAlreadyExistsException } from '../exceptions/email-already-exists.exception';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * @throws {UserNotFoundException}
   */
  public async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new UserNotFoundException(UserNotFoundException.MESSAGE);
    }

    return user;
  }

  /**
   * @throws {UserNotFoundException}
   */
  public async getUserByEmail(email: string): Promise<User> {
    const user: User = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new UserNotFoundException(UserNotFoundException.MESSAGE);
    }

    return user;
  }

  /**
   * @throws {EmailAlreadyExistsException}
   */
  public async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: dto.email });

    if (user) {
      throw new EmailAlreadyExistsException(EmailAlreadyExistsException.MESSAGE);
    }

    const password = bcrypt.hashSync(dto.password, 10);

    return await this.userRepository.save(new User(uuidv4(), dto.email, password, dto.name));
  }

  /**
   * @throws {EmailAlreadyInUseException}
   */
  public async updateUser(user: User, dto: UpdateUserDto): Promise<User> {
    if (dto.email && user.email !== dto.email) {
      const emailInUse = await this.userRepository.exist({ where: { email: dto.email } });

      if (emailInUse) {
        throw new EmailAlreadyInUseException(EmailAlreadyInUseException.MESSAGE);
      }

      user.email = dto.email;
    }

    if (dto.password) {
      user.password = bcrypt.hashSync(dto.password, 10);
    }

    if (dto.name) {
      user.name = dto.name;
    }

    return await this.userRepository.save(user);
  }

  public async deleteUser(user: User): Promise<void> {
    await this.userRepository.remove(user);
  }
}
