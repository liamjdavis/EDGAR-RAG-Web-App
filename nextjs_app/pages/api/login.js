import axios from 'axios';
import { generateToken } from '../../utils/auth';

export default async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            const response = await axios.post('http://user_backend:8000/login/', {
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Generate JWT token
            const token = generateToken({ email });

            // Set token in HTTP-only cookie
            res.setHeader('Set-Cookie', `access_token=${token}; HttpOnly; Path=/; Max-Age=1800;`);

            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error during login:', error); // Log the error
            res.status(500).json({ error: 'User login failed' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
