import axios from 'axios';
import cookie from 'cookie';

export default async function handler(req, res) {
    const { threadId } = req.query;

    if (req.method !== 'POST') {
        return res.status(405).end(); // Method Not Allowed
    }

    const cookies = cookie.parse(req.headers.cookie || '');
    const userId = cookies.user_id;

    if (!userId) {
        return res.status(401).json({ message: 'User ID not found in cookies' });
    }

    const { message } = req.body;

    try {
        const response = await axios.post(`http://your_fastapi_backend/threads/${threadId}/chats/`, {
            thread_id: parseInt(threadId),
            user_id: parseInt(userId),
            message
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error adding chat' });
    }
}
