import axios from 'axios';

export default async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            const response = await axios.post('http://user_db_container:8000/register/', {
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response Data:', response.data);

            res.status(201).json(response.data);
        } catch (error) {
            console.error('Error during registration:', error); // Log the error
            res.status(500).json({ error: 'User registration failed' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
