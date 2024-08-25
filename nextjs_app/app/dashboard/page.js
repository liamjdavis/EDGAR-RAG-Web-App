"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function Dashboard() {
    const router = useRouter();
    const [threads, setThreads] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Function to check authentication
    const checkAuth = async () => {
        try {
            await axios.get('/api/protected');
            return true;
        } catch (error) {
            window.location.href = '/';
            return false;
        }
    };

    // Function to create a new thread
    const createNewThread = async (threadId) => {
        try {
            const response = await axios.post('/api/addThread', { thread_id: threadId });
            return response.data;
        } catch (error) {
            console.error('Error creating new thread:', error);
        }
    };

    // Function to load threads
    const loadThreads = async () => {
        try {
            const response = await axios.get('/api/threads');
            let sortedThreads = response.data.sort((a, b) => a.id - b.id);
            
            // If there are no threads, create thread with ID 0
            if (sortedThreads.length === 0) {
                const newThread = await createNewThread(0);
                sortedThreads = [newThread];
            } else {
                // Check if we need to create a new thread
                const lastThreadId = sortedThreads[sortedThreads.length - 1].id;
                const newThreadId = lastThreadId + 1;
                const newThread = await createNewThread(newThreadId);
                sortedThreads.push(newThread);
            }

            setThreads(sortedThreads);
            if (sortedThreads.length > 0) {
                handleChatSelect(sortedThreads[0].id);
            }
        } catch (error) {
            console.error('Error loading threads:', error);
        }
    };

    // UseEffect for authentication check and thread creation
    useEffect(() => {
        const initDashboard = async () => {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                await loadThreads();
            }
        };
        initDashboard();
    }, [router]);

    const handleChatSelect = async (threadId) => {
        setSelectedChat(threadId);
        try {
            const response = await axios.get(`/api/threads/${threadId}/chats`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error loading chats:', error);
        }
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

    const handleCreateNewChat = async () => {
        try {
            const lastThreadId = threads.length > 0 ? threads[threads.length - 1].id : 0;
            const newThreadId = lastThreadId + 1;
            const newThread = await createNewThread(newThreadId);
            setThreads([...threads, newThread]);
            handleChatSelect(newThread.id);
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-1/4 p-4 bg-white border-r flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">Chats</h2>
                    <button
                        onClick={handleCreateNewChat}
                        className="px-2 py-1 ml-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
                    >
                        + Create new Chat
                    </button>
                </div>
                <ul className="list-none p-0 m-0 flex-1 overflow-y-auto">
                    {threads.map((thread) => (
                        <li
                            key={thread.id}
                            className={`p-2 mb-2 cursor-pointer ${selectedChat === thread.id ? 'bg-gray-200' : ''}`}
                            onClick={() => handleChatSelect(thread.id)}
                        >
                            Chat {thread.id}
                        </li>
                    ))}
                </ul>
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