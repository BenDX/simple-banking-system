import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET as string

export class AuthService {
    private static readonly secretKey = secretKey;

    static generateToken(data: any): string {
        return jwt.sign(data, this.secretKey, { expiresIn: '1h' });
    }

    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}