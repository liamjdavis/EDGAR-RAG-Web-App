import axios from 'axios';
import cookie from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end(); // Method Not Allowed
    }

    const cookies = cookie.parse(req.headers.cookie || '');
    const userId = cookies.user_id;

    if (!userId) {
        return res.status(401).json({ message: 'User ID not found in cookies' });
    }

    try {
        const response = await axios.get(`http://user_backend:8000/threads/`, {
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                user_id: userId,  // Pass user_id as a query parameter
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving threads' });
    }
}
