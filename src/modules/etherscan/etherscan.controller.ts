import { Controller, Get } from '@nestjs/common';
import { EtherscanService } from './etherscan.service';
import { MaxBalanceChangeResponseDto } from './types';

@Controller('etherscan')
export class EtherscanController {
  constructor(private readonly etherscanService: EtherscanService) {}

  @Get('max-balance-change')
  async getMaxBalanceChangeAddress(): Promise<MaxBalanceChangeResponseDto> {
    const addressInfo = await this.etherscanService.getMaxBalanceChangeAddress();
    return addressInfo;
  }
}
