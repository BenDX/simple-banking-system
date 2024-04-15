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

    async deposit(amount: number): Promise<void> {
        await this.performTransaction('Deposit', amount);
    }

    async withdraw(amount: number): Promise<void> {
        if (this.balance >= amount) {
            await this.performTransaction('Withdrawal', -amount);
            return;
        }
        throw new Error('Insufficient funds');
    }

    async transfer(to: Account, amount: number): Promise<void> {
        if (this.balance >= amount) {
            await Promise.all([
                this.performTransaction(`Transfer to ${to.name}`, -amount),
                to.performTransaction(`Transfer from ${this.name}`, amount)
            ]);
            return;
        }
        throw new Error('Insufficient funds');
    }

    private async performTransaction(description: string, amount: number): Promise<void> {
        this.balance += amount;
        this.transactions.push(new Transaction(description, amount));
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
app.post('/account/:name/deposit', async (req: Request, res: Response) => {
    const { name } = req.params;
    const { amount } = req.body;
    const account = accounts[name];
    if (!account || amount === undefined || amount <= 0) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    try {
        await account.deposit(amount);
        res.json(account);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }

    }
});

// 提款 API
app.post('/account/:name/withdraw', async (req: Request, res: Response) => {
    const { name } = req.params;
    const { amount } = req.body;
    const account = accounts[name];
    if (!account || amount === undefined || amount <= 0) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    try {
        await account.withdraw(amount);
        res.json(account);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});

// 轉帳 API
app.post('/account/:from/transfer/:to', async (req: Request, res: Response) => {
    const { from, to } = req.params;
    const { amount } = req.body;
    const fromAccount = accounts[from];
    const toAccount = accounts[to];
    if (!fromAccount || !toAccount || amount === undefined || amount <= 0) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    try {
        await fromAccount.transfer(toAccount, amount);
        res.json({ message: 'Transfer successful' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
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
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default server;
