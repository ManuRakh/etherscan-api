import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { EtherscanService } from '../etherscan.service';
import { MaxBalanceChangeResponseDto, Transaction } from '../types';

describe('EtherscanService', () => {
  let etherscanService: EtherscanService;
  let configService: ConfigService;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    configService = new ConfigService();
      mockAxios = new MockAdapter(axios);
      console.log({ configService });
    etherscanService = new EtherscanService(configService);
    vi.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'API_URL') return 'https://api.etherscan.io/api';
      if (key === 'API_KEY') return 'test-api-key';
    });
  });

  it('should get transactions from the last 100 blocks', async () => {
    const mockBlockNumber = 100;
    vi.spyOn(etherscanService, 'getLatestBlockNumber').mockResolvedValue(mockBlockNumber);

    const mockResponse = {
      result: {
        transactions: [{ from: '0xaddress1', to: '0xaddress2', value: '0xde0b6b3a7640000' }], // 1 ETH
      },
    };
    mockAxios.onGet(/eth_getBlockByNumber/).reply(200, mockResponse);

    const transactions = await etherscanService.getTransactionsFromLast100Blocks();
    expect(transactions.length).toBeGreaterThan(0);
  });

  it('should return the address with the maximum balance change', async () => {
    const mockTransactions: Transaction[] = [
      { from: '0xaddress1', to: '0xaddress2', value: '0xde0b6b3a7640000' }, // 1 ETH
      { from: '0xaddress3', to: '0xaddress4', value: '0x1bc16d674ec80000' }, // 2 ETH
      { from: '0xaddress1', to: '0xaddress5', value: '0x29a2241af62c0000' }, // 3 ETH
    ];
    vi.spyOn(etherscanService, 'getTransactionsFromLast100Blocks').mockResolvedValue(mockTransactions);

    const result: MaxBalanceChangeResponseDto = await etherscanService.getMaxBalanceChangeAddress();
    expect(result.maxAddress).toBe('0xaddress1');
    expect(result.maxChange).toBe(4 * 10 ** 18);
  });
});
