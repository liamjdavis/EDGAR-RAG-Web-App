"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function Dashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/api/checkAuth');
                if (response.status === 200) {
                    setIsAuthenticated(true);
                } else {
                    router.push('/');
                }
            } catch (error) {
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        // Load chat messages here
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setMessages([...messages, { sender: 'user', text: newMessage }, { sender: 'bot', text: 'Generating response, this may take a minute ...' }]);
        setNewMessage('');
        setIsGenerating(true);

        try {
            const response = await axios.post('/api/retrieve', {
                question: newMessage
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = { sender: 'bot', text: response.data.answer };
                return updatedMessages;
            });
            setIsGenerating(false);
        } catch (error) {
            console.error('Error sending message:', error);
            setIsGenerating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-1/4 p-4 bg-white border-r flex flex-col justify-between">
                <div>
                    <h2 className="mb-4 text-xl font-bold">Chats</h2>
                    <ul>
                        <li
                            className={`p-2 mb-2 cursor-pointer ${selectedChat === 'Chat 1' ? 'bg-gray-200' : ''}`}
                            onClick={() => handleChatSelect('Chat 1')}
                        >
                            Chat 1
                        </li>
                        <li
                            className={`p-2 mb-2 cursor-pointer ${selectedChat === 'Chat 2' ? 'bg-gray-200' : ''}`}
                            onClick={() => handleChatSelect('Chat 2')}
                        >
                            Chat 2
                        </li>
                    </ul>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 mt-4 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
            <div className="flex-1 p-4 flex flex-col">
                <div className="flex-1 p-4 mb-4 bg-white border rounded overflow-y-scroll">
                    {messages.map((message, index) => (
                        <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            <span className={`inline-block p-2 rounded ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                {message.text}
                            </span>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded"
                        placeholder="Type a message..."
                        required
                    />
                    <button type="submit" className="px-4 py-2 ml-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700" disabled={isGenerating}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Dashboard;