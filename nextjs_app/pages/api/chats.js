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

    const { threadId } = req.query;
    
    if (!threadId || isNaN(parseInt(threadId))) {
        return res.status(400).json({ message: 'Invalid thread ID' });
    }

    try {
        const response = await axios.get(`http://user_backend:8000/chats/`, {
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                thread_id: threadId,
                user_id: userId,
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error retrieving chats:', error.response ? error.response.data : error);
        res.status(500).json({ message: 'Error retrieving chats' });
    }
}