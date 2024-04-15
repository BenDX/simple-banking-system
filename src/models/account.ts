import { Transaction } from "./transaction";

/**
 * 帳戶 interface
 */
export interface Account {
    id: number;
    name: string;
    balance: number;
    // 模擬 db 外鍵
    transactions: Transaction[];
    // 模擬 db row lock
    isLocked: boolean;
}