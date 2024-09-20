import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EtherscanController } from './modules/etherscan/etherscan.controller';
import { EtherscanService } from './modules/etherscan/etherscan.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  controllers: [EtherscanController],
  providers: [EtherscanService],
})
export class AppModule {}
