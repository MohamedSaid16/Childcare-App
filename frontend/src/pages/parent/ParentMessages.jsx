import React, { useState, useEffect } from 'react';
import { FaSearch, FaPaperPlane, FaUser, FaClock } from 'react-icons/fa';

const ParentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        sender: 'Teacher Sarah',
        avatar: '👩‍🏫',
        lastMessage: 'Emma had a great day today! She really enjoyed the art activity.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unread: true,
        type: 'teacher'
      },
      {
        id: 2,
        sender: 'Nursery Admin',
        avatar: '🏫',
        lastMessage: 'Reminder: Parent-teacher meetings next week',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        unread: false,
        type: 'admin'
      },
      {
        id: 3,
        sender: 'Dr. Smith',
        avatar: '👨‍⚕️',
        lastMessage: 'Medical form for Emma needs to be updated',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        unread: false,
        type: 'medical'
      }
    ];

    setMessages(mockMessages);
    setLoading(false);
  }, []);

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMessage) return;

    const updatedMessages = messages.map(msg =>
      msg.id === selectedMessage.id
        ? {
            ...msg,
            lastMessage: newMessage,
            timestamp: new Date(),
            unread: false
          }
        : msg
    );

    setMessages(updatedMessages);
    setNewMessage('');
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'medical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="mt-1 text-sm text-gray-600">
              Communicate with teachers and nursery staff
            </p>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex h-[600px]">
              {/* Messages List */}
              <div className="w-1/3 border-r border-gray-200">
                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Messages */}
                <div className="overflow-y-auto h-full">
                  {filteredMessages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No messages found
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          selectedMessage?.id === message.id ? 'bg-indigo-50' : ''
                        } ${message.unread ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                              {message.avatar}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {message.sender}
                              </p>
                              <span className="text-xs text-gray-500">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {message.lastMessage}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMessageTypeColor(message.type)}`}>
                                {message.type}
                              </span>
                              {message.unread && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 flex flex-col">
                {selectedMessage ? (
                  <>
                    {/* Message Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                          {selectedMessage.avatar}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {selectedMessage.sender}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Last active {selectedMessage.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages History */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          {selectedMessage.avatar}
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                          <p className="text-sm text-gray-900">
                            {selectedMessage.lastMessage}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedMessage.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Example response */}
                      <div className="flex items-start space-x-3 justify-end">
                        <div className="bg-indigo-100 rounded-lg p-3 max-w-xs">
                          <p className="text-sm text-gray-900">
                            Thank you for the update! We're glad to hear Emma is enjoying the activities.
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Just now
                          </p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-sm">
                          <FaUser className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaPaperPlane className="h-4 w-4 mr-2" />
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No message selected</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select a conversation from the list to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentMessages;