import express, { Request, Response } from 'express';

/**
 * 銀行帳戶 class
 */
class Account {
    name: string;
    balance: number;
    transactions: Transaction[];

    constructor(name: string, balance: number) {
        this.name = name;
        this.balance = balance;
        this.transactions = [];
    }

    deposit(amount: number) {
        this.balance += amount;
        this.transactions.push(new Transaction('Deposit', amount));
    }

    withdraw(amount: number) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.transactions.push(new Transaction('Withdrawal', amount));
            return true;
        } else {
            return false;
        }
    }

    transfer(to: Account, amount: number) {
        if (this.withdraw(amount)) {
            to.deposit(amount);
            this.transactions.push(new Transaction(`Transfer to ${to.name}`, amount));
            to.transactions.push(new Transaction(`Transfer from ${this.name}`, amount));
            return true;
        } else {
            return false;
        }
    }
}

/**
 * 交易 class
 */
class Transaction {
    timestamp: Date;
    description: string;
    amount: number;

    constructor(description: string, amount: number) {
        this.timestamp = new Date();
        this.description = description;
        this.amount = amount;
    }
}

// Initialize Express app
const app = express();
app.use(express.json());

/**
 * 將帳戶資訊存在記憶體中
 * 
 * TODO: 持久化到資料庫中
 */
const accounts: { [key: string]: Account } = {};

// 建立帳戶 API
app.post('/account', (req: Request, res: Response) => {
    const { name, balance } = req.body;
    if (!name || balance === undefined || balance < 0) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const account = new Account(name, balance);
    accounts[name] = account;
    res.status(201).json(account);
});

// 存款 API
app.post('/account/:name/deposit', (req: Request, res: Response) => {
    const { name } = req.params;
    const { amount } = req.body;
    const account = accounts[name];
    if (!account || amount === undefined || amount <= 0) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    account.deposit(amount);
    res.json(account);
});

// 提款 API
app.post('/account/:name/withdraw', (req: Request, res: Response) => {
    const { name } = req.params;
    const { amount } = req.body;
    const account = accounts[name];
    if (!account || amount === undefined || amount <= 0) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    if (!account.withdraw(amount)) {
        return res.status(400).json({ error: 'Insufficient funds' });
    }
    res.json(account);
});

// 轉帳 API
app.post('/account/:from/transfer/:to', (req: Request, res: Response) => {
    const { from, to } = req.params;
    const { amount } = req.body;
    const fromAccount = accounts[from];
    const toAccount = accounts[to];
    if (!fromAccount || !toAccount || amount === undefined || amount <= 0) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    if (!fromAccount.transfer(toAccount, amount)) {
        return res.status(400).json({ error: 'Transfer failed' });
    }
    res.json({ message: 'Transfer successful' });
});

// 取得帳戶資訊 API
app.get('/account/:name', (req: Request, res: Response) => {
    const { name } = req.params;
    const account = accounts[name];
    if (!account) {
        return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
});

// 取得交易明細 API
app.get('/account/:name/transactions', (req: Request, res: Response) => {
    const { name } = req.params;
    const account = accounts[name];
    if (!account) {
        return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account.transactions);
});

// 啟動 express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});