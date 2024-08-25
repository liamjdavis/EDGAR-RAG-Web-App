import axios from 'axios';
import { generateToken } from '../../utils/auth';

export default async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            // Perform login request
            const loginResponse = await axios.post('http://user_backend:8000/login/', {
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Fetch user ID using the provided email
            const userIdResponse = await axios.get('http://user_backend:8000/userid/', {
                params: { email }
            });

            const userId = userIdResponse.data.user_id;

            // Generate JWT token (optional, if you want to keep this logic)
            const token = generateToken({ email });

            // Set both user ID and token in HTTP-only cookies
            res.setHeader('Set-Cookie', [
                `access_token=${token}; HttpOnly; Path=/; Max-Age=1800;`,
                `user_id=${userId}; HttpOnly; Path=/; Max-Age=1800;`
            ]);

            res.status(200).json(loginResponse.data);
        } catch (error) {
            console.error('Error during login:', error); // Log the error
            res.status(500).json({ error: 'User login failed' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
