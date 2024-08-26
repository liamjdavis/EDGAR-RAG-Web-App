import axios from 'axios';

export default async function handler(req, res) {
    const { threadId } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).end(); // Method Not Allowed
    }

    try {
        const response = await axios.get(`http://user_backend:8000/threads/${threadId}/chats/`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error retrieving chats:', error);
        res.status(500).json({ message: 'Error retrieving chats' });
    }
}