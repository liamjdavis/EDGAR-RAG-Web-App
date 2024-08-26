import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).end(); // Method Not Allowed
    }

    const { thread_id } = req.body;

    try {
        // Make a DELETE request to the FastAPI backend
        const response = await axios.delete(`http://user_backend:8000/threads/${thread_id}/`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({ message: error.response.data.detail || 'Error deleting thread' });
        } else {
            res.status(500).json({ message: 'Error deleting thread' });
        }
    }
}