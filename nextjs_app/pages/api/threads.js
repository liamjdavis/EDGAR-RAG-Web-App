import axios from 'axios';

export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const response = await axios.get('http://user_backend:8000/threads', {
                    headers: {
                        Cookie: req.headers.cookie // Pass the cookies to the FastAPI server
                    }
                });
                res.status(200).json(response.data);
            } catch (error) {
                res.status(error.response?.status || 500).json({ message: error.message });
            }
            break;
        case 'POST':
            try {
                const response = await axios.post('http://user_backend:8000/threads', req.body, {
                    headers: {
                        Cookie: req.headers.cookie // Pass the cookies to the FastAPI server
                    }
                });
                res.status(201).json(response.data);
            } catch (error) {
                res.status(error.response?.status || 500).json({ message: error.message });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
