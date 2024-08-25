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

    const { thread_id } = req.body;

    try {
        // Make a POST request to the FastAPI backend
        const response = await axios.post(`http://user_backend:8000/threads/`, {
            user_id: parseInt(userId),
            thread_id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // If you need to handle the title separately, you can do so here
        // For example, you might store it locally or use it in a different way

        res.status(201).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({ message: error.response.data.detail || 'Error adding thread' });
        } else {
            res.status(500).json({ message: 'Error adding thread' });
        }
    }
}