import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { MaxBalanceChangeResponseDto, Transaction } from './types';

@Injectable()
export class EtherscanService {
  private readonly API_URL: string;
  private readonly API_KEY: string;
  
  constructor(private configService: ConfigService) {
      this.API_URL = this.configService.get<string>('API_URL');
      this.API_KEY = this.configService.get<string>('API_KEY');
  }
    
    async getLatestBlockNumber(): Promise<number> {
        const response = await axios.get(`${this.API_URL}?module=proxy&action=eth_blockNumber&apikey=${this.API_KEY}`);

        return parseInt(response.data.result, 16);
  }

    async getBlockTransactions(blockNumber: number): Promise<Transaction[]> {
        const response = await axios.get(
        `${this.API_URL}?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber.toString(16)}&boolean=true&apikey=${this.API_KEY}`,
        );

        return response.data.result.transactions;
  }

  async getTransactionsFromLast100Blocks(): Promise<Transaction[]> {
    const latestBlock = await this.getLatestBlockNumber();
    let transactions = [];
    
    const blockNumbers = Array.from({ length: 100 }, (_, i) => latestBlock - i);
  
    await Promise.all(
      blockNumbers.map(async blockNumber => {
        try {
          const blockTransactions = await this.getBlockTransactions(blockNumber);
          transactions = transactions.concat(blockTransactions);
        } catch (error) {
          console.error(`Error while getting tx from block: ${blockNumber}:`, error);
        }
      })
    );
  
    return transactions.filter(Boolean);
  }

  async getMaxBalanceChangeAddress(): Promise<MaxBalanceChangeResponseDto> {
    const transactions = await this.getTransactionsFromLast100Blocks();
    const balances: { [address: string]: number } = {};
  
    transactions.forEach((tx: Transaction) => {
      const value = parseInt(tx.value, 16); 
  
      if (balances[tx.from]) {
        balances[tx.from] -= value;
      } else {
        balances[tx.from] = -value;
      }
  
      if (balances[tx.to]) {
        balances[tx.to] += value;
      } else {
        balances[tx.to] = value;
      }
    });
  
    let maxAddress = '';
    let maxChange = 0;
  
    Object.keys(balances).forEach(address => {
      const absChange = Math.abs(balances[address]);
      if (absChange > maxChange) {
        maxChange = absChange;
        maxAddress = address;
      }
    });
  
    return { maxAddress, maxChange };
  }
}
