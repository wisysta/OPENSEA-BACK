import { NftService } from './nft.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { map } from 'rxjs';
import { BigNumber } from 'ethers';

@Controller('nft')
export class NftController {
    constructor(private nftService: NftService) {}

    @Get('/contract/:address')
    async getContractMetadata(@Param() param) {
        const { address } = param;
        return this.nftService.getNftContract(address);
    }

    @Get('/contract/:address/tokens')
    async getNfts(@Param() param, @Query() query) {
        const { address } = param;
        const { startToken } = query;

        return this.nftService.getNfts(address, startToken).pipe(
            map((result) => ({
                result,
                nextToken: this.nftService.getNextToken(result),
            })),
        );
    }
}
