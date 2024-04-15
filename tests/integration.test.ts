import request from 'supertest';
import app from '../src/app';
import { AuthService } from '../src/services/authService';

describe('Integration Tests', () => {
    let token: string;

    beforeAll(() => {
        // Generate JWT token for authentication
        token = AuthService.generateToken({ username: 'user' });
    });

    test('Create account', async () => {
        const res = await request(app)
            .post('/api/account')
            .send({ name: 'John', initialBalance: 100 });
        expect(res.status).toBe(201);
        expect(res.body.name).toBe('John');
        expect(res.body.balance).toBe(100);
    });

    test('Deposit money', async () => {
        const res = await request(app)
            .post('/api/account/John/deposit')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 50 });
        expect(res.status).toBe(200);
        expect(res.body.balance).toBe(150);
    });

    test('Withdraw money', async () => {
        const res = await request(app)
            .post('/api/account/John/withdraw')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 30 });
        expect(res.status).toBe(200);
        expect(res.body.balance).toBe(120);
    });

    test('Transfer money', async () => {
        await request(app)
            .post('/api/account')
            .send({ name: 'Alice', initialBalance: 200 });
        const res = await request(app)
            .post('/api/account/John/transfer/Alice')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 50 });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Transfer successful');
    });

    test('Withdraw with insufficient funds', async () => {
        const res = await request(app)
            .post('/api/account/John/withdraw')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 200 });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Insufficient funds');
    });

    test('Transfer with insufficient funds', async () => {
        await request(app)
            .post('/api/account')
            .send({ name: 'Bob', initialBalance: 100 });
        const res = await request(app)
            .post('/api/account/John/transfer/Bob')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 200 });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Insufficient funds');
    });
});