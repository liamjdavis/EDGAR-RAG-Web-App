"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Add your login logic here

        try {
            const response = await axios.post('/api/login', { email, password });
            if (response.status === 200) {
                // Login successful
                console.log('User logged in:', response.data.user);
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error('Login error:', error)
            setError('Username or Password Incorrect');
        }
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-6 bg-white rounded shadow-md">
                <h2 className="mb-4 text-2xl font-bold">Login</h2>
                {error && <p className="mb-4 text-red-600">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Don't have an account?</p>
                    <button
                        onClick={() => window.location.href = '/register'}
                        className="mt-2 text-blue-500 hover:underline"
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}