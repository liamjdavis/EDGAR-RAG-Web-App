"use client";

import { useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

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
            // Send a POST request to the logout API to clear the token cookie
            await axios.post('/api/logout');
            
            console.log('User logged out');
    
            // Redirect to the login page or perform other logout actions
            window.location.href = '/';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-1/4 p-4 bg-white border-r flex flex-col justify-between">
                <div>
                    <h2 className="mb-4 text-xl font-bold">Chats</h2>
                    <ul>
                        {/* Replace with dynamic chat list */}
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
                    {/* Replace with dynamic messages */}
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
                    <button type="submit" className="px-4 py-2 ml-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
