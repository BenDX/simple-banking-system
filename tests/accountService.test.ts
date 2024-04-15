import { AccountService } from '../src/services/accountService';

describe('Account Service', () => {
    let accountService: AccountService;

    beforeEach(() => {
        accountService = new AccountService();
    });

    test('Create account', () => {
        const account = accountService.createAccount('John', 100);
        expect(account.name).toBe('John');
        expect(account.balance).toBe(100);
        expect(account.transactions).toHaveLength(0);
    });

    test('Deposit money', () => {
        accountService.createAccount('John', 100);
        const account = accountService.deposit('John', 50);
        expect(account.balance).toBe(150);
        expect(account.transactions).toHaveLength(1);
    });

    test('Withdraw money', () => {
        accountService.createAccount('John', 100);
        const account = accountService.withdraw('John', 30);
        expect(account.balance).toBe(70);
        expect(account.transactions).toHaveLength(1);
    });

    test('Transfer money', () => {
        accountService.createAccount('John', 100);
        accountService.createAccount('Alice', 200);
        const [fromAccount, toAccount] = accountService.transfer('John', 'Alice', 50);
        expect(fromAccount.balance).toBe(50);
        expect(toAccount.balance).toBe(250);
        expect(fromAccount.transactions).toHaveLength(1);
        expect(toAccount.transactions).toHaveLength(1);
    });

    test('Withdraw with insufficient funds', () => {
        accountService.createAccount('John', 100);
        expect(() => {
            accountService.withdraw('John', 150);
        }).toThrow('Insufficient funds');
    });

    test('Transfer with insufficient funds', () => {
        accountService.createAccount('John', 100);
        accountService.createAccount('Alice', 200);
        expect(() => {
            accountService.transfer('John', 'Alice', 150);
        }).toThrow('Insufficient funds');
    });
});