import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || 'your-secret-key';

export const generateToken = (data) => {
    return jwt.sign(data, SECRET_KEY, { expiresIn: '30m' });
};

export const verifyToken = (token) => {
    return jwt.verify(token, secret);
};