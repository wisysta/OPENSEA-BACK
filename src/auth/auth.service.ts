import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthRequest, User } from 'src/entities';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { ethers } from 'ethers';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthRequest)
        private authRequestRepository: Repository<AuthRequest>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    generateSignatureMessage(authRequest: AuthRequest) {
        return `Welcome to OpenSea! \n\nWallet Address:\n${authRequest.address}\n\nNonce: ${authRequest.nonce}`;
    }

    async generateAuthRequest(address: string) {
        const authRequest = new AuthRequest();

        authRequest.address = address;
        authRequest.nonce = v4();
        authRequest.expiredAt = new Date(
            new Date().getTime() + 10 * 6 * 1000 * 5,
        );

        return this.authRequestRepository.save(authRequest);
    }

    async verifyAuthRequest(id: number, signature: string) {
        const authRequest = await this.authRequestRepository.findOne({
            where: { id, verified: false },
        });

        if (!authRequest) {
            throw new HttpException('auth not found', HttpStatus.BAD_REQUEST);
        }

        if (
            authRequest.expiredAt &&
            authRequest.expiredAt.getTime() < new Date().getTime()
        ) {
            throw new HttpException('expired', HttpStatus.BAD_REQUEST);
        }

        const recoverAddr = ethers.utils.verifyMessage(
            this.generateSignatureMessage(authRequest),
            signature,
        );

        if (
            recoverAddr.replace('0x', '').toLowerCase() !==
            authRequest.address.toLowerCase()
        ) {
            throw new HttpException('invalid', HttpStatus.BAD_REQUEST);
        }

        authRequest.verified = true;
        await this.authRequestRepository.save(authRequest);

        let user = await this.userRepository.findOne({
            where: { address: authRequest.address },
        });

        if (!user) {
            user = new User();
            user.address = authRequest.address;
            user = await this.userRepository.save(user);
        }

        // 엑세스 토큰 만료, 리프레시 토큰 발급 및 저장 로직은 이번코딩에선 생략
        return {
            accessToken: this.jwtService.sign({
                sub: user.id,
                address: user.address,
            }),
        };
    }
}
