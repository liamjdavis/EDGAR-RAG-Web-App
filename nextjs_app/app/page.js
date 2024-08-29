"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Logo from '../assets/SEC Sleuth Logo.png';

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center mb-4">
                <h1 className="mt-2 text-3xl font-bold">SEC Sleuth</h1>
                <p className="mt-2 text-sm text-gray-600 text-center">
                    Instantly retrieve and summarize public SEC filings with
                    our AI—turning complex reports into simple insights for smarter decisions.
                </p>
                <Image src={Logo} alt="Logo" width={200} height={200} />
            </div>
    
            <div className="flex flex-col items-center p-6 bg-white rounded shadow-md w-80">
                <h2 className="mb-4 text-2xl font-bold">Login</h2>
                {error && <p className="mb-4 text-red-600">{error}</p>}
                <form onSubmit={handleSubmit} className="w-full">
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