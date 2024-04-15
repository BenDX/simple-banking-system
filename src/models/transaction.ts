/**
 * 每筆交易 interface
 */
export interface Transaction {
    timestamp: Date;
    type: number;
    description: string;
    amount: number;
    fromAccountId: number;
    toAccountId: number;
}

export enum TransactionType {
    DEPOSIT = 0,
    WITHDRAW = 1,
}