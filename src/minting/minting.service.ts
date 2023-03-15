import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import { Nft, NftProperty } from 'src/entities';
import { Repository } from 'typeorm';

export interface NFTAttribute {
    trait_type: string;
    value: string;
}

export interface ILazyNft {
    address: string;
    name: string;
    image: string;
    description: string;
    attributes: NFTAttribute[];
}

@Injectable()
export class MintingService {
    constructor(
        @InjectRepository(Nft) private nftRepository: Repository<Nft>,
        @InjectRepository(NftProperty)
        private nftPropertyRepository: Repository<NftProperty>,
        private configService: ConfigService,
    ) {}

    get lazyMintingContract() {
        return this.configService.get('LAZY_MINTING_CONTRACT');
    }

    async gernerateNftLazy({
        address,
        name,
        image,
        description,
        attributes,
    }: ILazyNft) {
        const lastToken = await this.nftRepository.findOne({
            where: {
                creatorAddress: address,
                contractAddress: this.lazyMintingContract,
            },
            order: { tokenId: 'desc' },
        });

        let tokenIndex = 1;

        if (lastToken) {
            tokenIndex = parseInt(lastToken.tokenId.slice(40), 16) + 1;
        }

        const newToken = new Nft();
        newToken.creatorAddress = address;
        newToken.contractAddress = this.lazyMintingContract;
        newToken.name = name;
        newToken.description = description;
        newToken.image = image;
        newToken.isLazy = true;
        newToken.tokenId = (
            ethers.utils.hexZeroPad(ethers.utils.hexlify('0x' + address), 20) +
            ethers.utils.hexZeroPad(ethers.utils.hexlify(tokenIndex), 12)
        ).replace(/0x/g, '');
        newToken.properties = attributes
            .filter((property) => property.trait_type && property.value)
            .map(({ trait_type, value }) => {
                const property = new NftProperty();

                property.nft = newToken;
                property.propertyKey = trait_type;
                property.value = value;

                return property;
            });

        const result = await this.nftRepository.save(newToken);

        await this.nftPropertyRepository.save(newToken.properties);

        return result;
    }
}
