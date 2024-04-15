import express, { Request, Response } from 'express';
import { AccountService } from '../services/accountService';
import { AuthService } from '../services/authService';

const router = express.Router();
const accountService = new AccountService();

// 建立帳戶 API
router.post('/account', (req: Request, res: Response) => {
    try {
        const { name, initialBalance } = req.body;
        const account = accountService.createAccount(name, initialBalance);
        res.status(201).json(account);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});

// 存款 API
router.post('/account/:name/deposit', authenticateToken, (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { amount } = req.body;
        const account = accountService.deposit(name, amount);
        res.json(account);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});

// 提款 API
router.post('/account/:name/withdraw', authenticateToken, (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { amount } = req.body;
        const account = accountService.withdraw(name, amount);
        res.json(account);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});

// 轉帳 API
router.post('/account/:from/transfer/:to', authenticateToken, (req: Request, res: Response) => {
    try {
        const { from, to } = req.params;
        const { amount } = req.body;
        const [fromAccount, toAccount] = accountService.transfer(from, to, amount);
        res.json({ message: 'Transfer successful', fromAccount, toAccount });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});

// 登入
router.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    // Validate username and password (dummy validation for demonstration)
    if (username === 'user' && password === 'pass') {
        // Generate JWT token
        const token = AuthService.generateToken({ username });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// Middleware: 驗證 JWT
function authenticateToken(req: Request, res: Response, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401).send({ message: 'Token is not suppiled' });
    }
    try {
        AuthService.verifyToken(token);
        next();
    } catch (error) {
        // res.sendStatus(403);
        // 403 with msg is legal?
        res.sendStatus(403).send({ message: 'Token is not valid' });
    }
}

export default router;