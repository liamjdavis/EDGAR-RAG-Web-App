"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaTrash } from 'react-icons/fa';
import Cookies from 'js-cookie';

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

    let counter = 0;

    // Function to create a new thread with a timestamp-based ID
    const createNewThread = async () => {
        try {
            const threadId = (Date.now() % 1000000) + counter++;
            const response = await axios.post('/api/addThread', { thread_id: threadId });
            return response.data;
        } catch (error) {
            console.error('Error creating new thread:', error);
        }
    };

    // Function to delete a thread
    const deleteThread = async (threadId) => {
        try {
            await axios.delete('/api/deleteThread', {
                data: { thread_id: threadId }
            });
            const updatedThreads = threads.filter(thread => thread.id !== threadId);
            setThreads(updatedThreads);
            if (selectedChat === threadId) {
                setSelectedChat(null);
                setMessages([]);
            }
            if (updatedThreads.length === 0) {
                const newThread = await createNewThread();
                setThreads([newThread]);
                setSelectedChat(newThread.id);
                setMessages([]);
            }
        } catch (error) {
            console.error('Error deleting thread:', error);
        }
    };

    // Function to load threads
    const loadThreads = async () => {
        try {
            const response = await axios.get('/api/threads');
            let sortedThreads = response.data.sort((a, b) => a.id - b.id);
            
            // If there are no threads, create a thread with a timestamp-based ID
            if (sortedThreads.length === 0) {
                const newThread = await createNewThread();
                sortedThreads = [newThread];
            } else {
                // Check if we need to create a new thread
                const lastThreadId = sortedThreads[sortedThreads.length - 1].id;
                const newThreadId = Date.now();
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

    // UseEffect for authentication check and thread loading
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

        const userMessage = { sender: 'user', text: newMessage };
        const botMessage = { sender: 'bot', text: 'Generating response, this may take a minute ...' };

        setMessages([...messages, userMessage, botMessage]);
        setNewMessage('');
        setIsGenerating(true);

        try {
            // Generate the bot response
            const response = await axios.post('/api/retrieve', {
                question: newMessage
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        
            const botResponse = { sender: 'bot', text: response.data.answer };
        
            // Update state with the new messages
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, { sender: 'user', text: newMessage }, botResponse];
                return updatedMessages;
            });
        
            // Retrieve userID and save messages
            const userID = Cookies.get('user_id'); // Retrieve userID from cookie
        
            if (!userID) {
                throw new Error('User ID not found in cookies');
            }
            
            // save chats
            await Promise.all([
                axios.post(`/api/addChat`, {
                    thread_id: selectedChat,
                    user_id: userID, // Use retrieved user ID
                    message: newMessage
                }),
                axios.post(`/api/addChat`, {
                    thread_id: selectedChat,
                    user_id: userID, // Use retrieved user ID
                    message: response.data.answer
                })
            ]);
        
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
            const newThread = await createNewThread();
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
                            className={`p-2 mb-2 cursor-pointer flex justify-between items-center ${selectedChat === thread.id ? 'bg-gray-200' : ''}`}
                            onClick={() => handleChatSelect(thread.id)}
                        >
                            <span>Chat {thread.id}</span>
                            <FaTrash
                                className="text-red-500 cursor-pointer hover:text-red-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteThread(thread.id);
                                }}
                            />
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
