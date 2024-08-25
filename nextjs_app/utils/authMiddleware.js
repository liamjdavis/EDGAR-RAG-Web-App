import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

export const authMiddleware = (handler) => {
    return async (req, res) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay the check
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return handler(req, res);
        } catch (error) {
            console.error('Error verifying token:', error); // Log the error
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };
};
