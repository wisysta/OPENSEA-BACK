import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthRequest, NftContract, Order, User } from './entities';
import { Nft } from './entities/Nft';
import { NftProperty } from './entities/NftProperty';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { MintingController } from './minting/minting.controller';
import { MintingService } from './minting/minting.service';
import { NftController } from './nft/nft.controller';
import { NftService } from './nft/nft.service';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { NftConsumer } from './nft/nft.consumer';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';

@Module({
    imports: [
        HttpModule,
        ConfigModule.forRoot(),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configservice: ConfigService) => ({
                redis: {
                    host: configservice.get('REDIS_HOST'),
                    port: configservice.get('REDIS_PORT'),
                    password: configservice.get('REDIS_PASSWORD'),
                },
            }),
        }),
        BullModule.registerQueue({
            name: 'nft',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule, AuthModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DBNAME'),
                entities: [
                    AuthRequest,
                    User,
                    Nft,
                    NftProperty,
                    NftContract,
                    Order,
                ],
                // 프로덕션환경에서 실행 x
                synchronize: true,
            }),
        }),
        TypeOrmModule.forFeature([User, Nft, NftProperty, NftContract, Order]),
        AuthModule,
    ],
    controllers: [
        UserController,
        MintingController,
        NftController,
        OrderController,
    ],
    providers: [
        AppService,
        UserService,
        MintingService,
        NftService,
        NftConsumer,
        OrderService,
    ],
})
export class AppModule {}
