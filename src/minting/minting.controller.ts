import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MintingService } from './minting.service';

@Controller('minting')
export class MintingController {
    constructor(private mintingService: MintingService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async mintLazy(@Body() body, @Request() request) {
        const { address } = request.user;
        const { name, image, description, properties } = body;

        const token = await this.mintingService.gernerateNftLazy({
            address,
            name,
            image,
            description,
            attributes: properties,
        });

        return {
            ...token,
            properties: token.properties.map((v) => ({
                trait_type: v.propertyKey,
                value: v.value,
            })),
        };
    }
}
