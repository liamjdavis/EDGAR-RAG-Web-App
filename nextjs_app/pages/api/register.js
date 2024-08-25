import axios from 'axios';
import { generateToken } from '../../utils/auth';  // Assuming you have a utility function for generating JWT

export default async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            // Perform registration request
            const registerResponse = await axios.post('http://user_backend:8000/register/', {
                email,
                password,
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

            // Generate JWT token
            const token = generateToken({ email, userId });

            // Set both user ID and token in HTTP-only cookies
            res.setHeader('Set-Cookie', [
                `access_token=${token}; HttpOnly; Path=/; Max-Age=1800;`,
                `user_id=${userId}; HttpOnly; Path=/; Max-Age=1800;`
            ]);

            res.status(201).json(registerResponse.data);
        } catch (error) {
            console.error('Error during registration:', error); // Log the error
            res.status(500).json({ error: 'User registration failed' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
