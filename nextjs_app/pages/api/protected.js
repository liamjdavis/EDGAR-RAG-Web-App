import { authMiddleware } from '../../utils/authMiddleware';

const handler = async (req, res) => {
    res.status(200).json({ message: 'This is a protected route' });
};

export default authMiddleware(handler);
