export interface Transaction {
    from: string;
    to: string;
    value: string;
}

export interface MaxBalanceChangeResponseDto {
    maxAddress: string;
    maxChange: number
}