import axios from 'axios';
import { hashPassword } from '../../utils/auth';

export default async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            // Hash the password before sending it to the backend
            const hashedPassword = await hashPassword(password);

            const response = await axios.post('http://user_backend:8000/register/', {
                email,
                password: hashedPassword
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            res.status(201).json(response.data);
        } catch (error) {
            console.error('Error during registration:', error); // Log the error
            res.status(500).json({ error: 'User registration failed' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
