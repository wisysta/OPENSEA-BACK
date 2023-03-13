import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository) {}

    async getUser(id: number) {
        return this.userRepository.findOneBy({ id });
    }
}
