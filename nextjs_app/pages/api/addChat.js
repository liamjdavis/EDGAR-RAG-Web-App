import axios from 'axios';
import cookie from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end(); // Method Not Allowed
    }

    const cookies = cookie.parse(req.headers.cookie || '');
    const userId = cookies.user_id;

    if (!userId) {
        return res.status(401).json({ message: 'User ID not found in cookies' });
    }

    const { threadId, message } = req.body;

    try {
        const response = await axios.post('http://user_backend:8000/chats/', {
            thread_id: parseInt(threadId),
            user_id: parseInt(userId),
            message,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        res.status(201).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({ message: error.response.data.detail || 'Error adding chat' });
        } else {
            res.status(500).json({ message: 'Error adding chat' });
        }
    }
}