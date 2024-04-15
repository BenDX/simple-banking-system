import { Account } from '../models/account';
import { Transaction, TransactionType } from '../models/transaction';
import bcrypt from 'bcrypt';

export class AccountService {
    /**
     * 將帳戶資訊存在記憶體中
     * 
     * TODO: 持久化到資料庫中
     */
    private accounts: { [name: string]: Account } = {};

    createAccount(name: string, initialBalance: number): Account {
        if (initialBalance < 0) {
            throw new Error('初始金額不能為負數');
        }
        const account: Account = {
            name,
            balance: initialBalance,
            transactions: [],
            // 紀錄該帳戶是否在操作中(模擬db lock row)
            isLocked: false,
        };
        // 產生密碼 & hash
        // password = generatePassword();
        // passwordHashed = bcrypt.hashSync(password);
        if (typeof this.accounts[name] === undefined) {
            this.accounts[name] = account;
        } else {
            throw new Error('該帳戶已存在');
        }

        return account;
    }

    deposit(accountName: string, amount: number): Account {
        const account = this.getAccountByName(accountName);
        if (amount <= 0) {
            throw new Error('存款金額必須大於 0');
        }
        account.balance += amount;
        // account.transactions.push(this.createTransaction('Deposit', amount));
        account.transactions.push(this.createTransaction(TransactionType.DEPOSIT, amount));
        return account;
    }

    withdraw(accountName: string, amount: number): Account {
        const account = this.getAccountByName(accountName);
        if (amount <= 0) {
            throw new Error('提款金額必須大於 0');
        }
        if (account.balance < amount) {
            throw new Error('餘額不足');
        }
        account.balance -= amount;
        account.transactions.push(this.createTransaction('Withdrawal', -amount));
        return account;
    }


    transfer(fromAccountName: string, toAccountName: string, amount: number): [Account, Account] {
        const fromAccount = this.getAccountByName(fromAccountName);
        const toAccount = this.getAccountByName(toAccountName);
        
        // Lock both accounts to ensure atomicity
        fromAccount.isLocked = true;
        toAccount.isLocked = true;

        try {
            if (fromAccount.balance < amount) {
                throw new Error('Insufficient funds');
            }
            fromAccount.balance -= amount;
            toAccount.balance += amount;
            const fromTransaction = this.createTransaction(`Transfer to ${toAccountName}`, -amount);
            const toTransaction = this.createTransaction(`Transfer from ${fromAccountName}`, amount);
            fromAccount.transactions.push(fromTransaction);
            toAccount.transactions.push(toTransaction);
            return [fromAccount, toAccount];
        } finally {
            // Unlock both accounts after the transaction
            fromAccount.isLocked = false;
            toAccount.isLocked = false;
        }
    }

    private createTransaction(type: number, description: string, amount: number): Transaction {
        return {
            timestamp: new Date(),
            description,
            amount,
        };
    }

    private getAccountByName(name: string): Account {
        const account = this.accounts[name];
        if (!account) {
            throw new Error('Account not found');
        }
        if (account.isLocked) {
            throw new Error('Account is currently locked');
        }
        return account;
    }
}