import axios from 'axios';

export default async (req, res) => {
    if (req.method === 'POST') {
        const { question } = req.body;

        try {
            const response = await axios.post('http://retriever_container:80/retrieve/', {
                question
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error retrieving message:', error); // Log the error
            res.status(500).json({ error: 'Message retrieval failed' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
