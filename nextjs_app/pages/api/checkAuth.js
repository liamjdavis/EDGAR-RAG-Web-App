import { verifyToken } from '../../utils/auth';

export default function handler(req, res) {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        verifyToken(token);
        res.status(200).json({ message: 'Authenticated' });
    } catch (error) {
        res.status(401).json({ message: 'Not authenticated' });
    }
}
