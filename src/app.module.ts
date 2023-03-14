import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthRequest, User } from './entities';
import { Nft } from './entities/Nft';
import { NftProperty } from './entities/NftProperty';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { MintingController } from './minting/minting.controller';
import { MintingService } from './minting/minting.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule, AuthModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DBNAME'),
                entities: [AuthRequest, User, Nft, NftProperty],
                // 프로덕션환경에서 실행 x
                synchronize: true,
            }),
        }),
        TypeOrmModule.forFeature([User, Nft, NftProperty]),
        AuthModule,
    ],
    controllers: [AppController, UserController, MintingController],
    providers: [AppService, UserService, MintingService],
})
export class AppModule {}
