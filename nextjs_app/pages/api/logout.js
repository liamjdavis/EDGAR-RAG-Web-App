export default async (req, res) => {
    if (req.method === 'POST') {
        // Clear the authentication token cookie by setting it with an expired date
        res.setHeader('Set-Cookie', `access_token=; HttpOnly; Path=/; Max-Age=0;`);
        res.status(200).json({ message: 'Logged out successfully' });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};