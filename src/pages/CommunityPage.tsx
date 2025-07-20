import React, { useEffect, useState } from 'react';
import { Users, MessageCircle, Bell, Search, Settings, BookOpen, Calendar, Folder, Star, Plus, MoreHorizontal, Phone, Video, Send, Mic } from 'lucide-react';
import Link from 'next/link';

interface NetworkGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  lastActive: string;
  unreadMessages?: number;
  joined?: boolean;
  image: string;
  onlineMembers?: number;
  category?: string;
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  avatar: string;
}

const initialNetworkGroups: NetworkGroup[] = [
  {
    id: 'sme-network',
    name: 'SME Network',
    description: 'Connect with fellow small and medium enterprise owners to share experiences and opportunities',
    members: 2547,
    onlineMembers: 156,
    lastActive: '2 min ago',
    unreadMessages: 12,
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Business'
  },
  {
    id: 'finance-network',
    name: 'Finance Professionals Network',
    description: 'Discussion group for finance professionals to share insights and best practices',
    members: 1893,
    onlineMembers: 89,
    lastActive: '5 min ago',
    unreadMessages: 8,
    image: 'https://images.pexels.com/photos/7567473/pexels-photo-7567473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Finance'
  },
  {
    id: 'managers-network',
    name: 'Managers Network',
    description: 'Leadership and management discussions for experienced managers',
    members: 2156,
    onlineMembers: 234,
    lastActive: 'Just now',
    unreadMessages: 15,
    image: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Leadership'
  },
  {
    id: 'techies-network',
    name: 'Techies Network',
    description: 'Tech professionals sharing knowledge and discussing latest trends',
    members: 3102,
    onlineMembers: 445,
    lastActive: '1 min ago',
    unreadMessages: 23,
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Technology'
  },
  {
    id: 'lawyers-network',
    name: 'Lawyers Network',
    description: 'Legal professionals discussing industry trends and sharing expertise',
    members: 1456,
    onlineMembers: 67,
    lastActive: '10 min ago',
    unreadMessages: 5,
    image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Legal'
  },
  {
    id: 'marketers-network',
    name: 'Marketers Network',
    description: 'Marketing professionals sharing strategies and industry insights',
    members: 2789,
    onlineMembers: 178,
    lastActive: '3 min ago',
    unreadMessages: 17,
    image: 'https://images.pexels.com/photos/1447418/pexels-photo-1447418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Marketing'
  },
  {
    id: 'job-hunting',
    name: 'Job Hunting Help Group',
    description: 'Support and resources for job seekers across all industries',
    members: 4231,
    onlineMembers: 567,
    lastActive: 'Just now',
    unreadMessages: 31,
    image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Career'
  },
];

const sampleMessages: Message[] = [
  {
    id: '1',
    content: 'Has anyone tried the new business registration process in Kenya?',
    sender: 'Sarah Johnson',
    timestamp: '10:30 AM',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
  },
  {
    id: '2',
    content: 'Yes! It\'s much faster now with the eCitizen portal. Takes about 2-3 days instead of weeks.',
    sender: 'Mike Chen',
    timestamp: '10:32 AM',
    avatar: 'https://images.pexels.com/photos/5439367/pexels-photo-5439367.jpeg'
  },
  {
    id: '3',
    content: 'Great tip! I\'ll check it out. Thanks Mike!',
    sender: 'Sarah Johnson',
    timestamp: '10:35 AM',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
  }
];

const CommunityPage: React.FC = () => {
  const [groups, setGroups] = useState<NetworkGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<NetworkGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'work' | 'personal' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Load joined groups from localStorage on initial render
  useEffect(() => {
    const joinedGroups = localStorage.getItem('joinedGroups');
    const joinedGroupIds = joinedGroups ? JSON.parse(joinedGroups) : [];

    setGroups(initialNetworkGroups.map(group => ({
      ...group,
      joined: joinedGroupIds.includes(group.id)
    })));
  }, []);

  const handleJoinGroup = (groupId: string) => {
    const joinedGroups = localStorage.getItem('joinedGroups');
    const joinedGroupIds = joinedGroups ? JSON.parse(joinedGroups) : [];

    if (joinedGroupIds.includes(groupId)) {
      // Leave group
      const updatedJoinedGroups = joinedGroupIds.filter((id: string) => id !== groupId);
      localStorage.setItem('joinedGroups', JSON.stringify(updatedJoinedGroups));
    } else {
      // Join group
      joinedGroupIds.push(groupId);
      localStorage.setItem('joinedGroups', JSON.stringify(joinedGroupIds));
    }

    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId ? { ...group, joined: !group.joined } : group
      )
    );
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'joined') return group.joined && matchesSearch;
    if (activeTab === 'work') return group.category === 'Business' && matchesSearch;
    if (activeTab === 'personal') return group.category === 'Career' && matchesSearch;

    return matchesSearch;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // Here you would typically send the message to your backend
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar - Navigation */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">JD</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">John Doe</p>
              <p className="text-sm text-gray-400">Online</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'all' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span>All Communities</span>
            </button>
            <button
              onClick={() => setActiveTab('joined')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'joined' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>My Communities</span>
            </button>
            <button
              onClick={() => setActiveTab('work')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'work' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>Work</span>
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'personal' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Personal</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'saved' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Star className="h-5 w-5" />
              <span>Saved</span>
            </button>
          </nav>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-700">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Center Column - Groups List */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Communities</h1>
              <p className="text-sm text-gray-400">{filteredGroups.length} communities available</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Community</span>
            </button>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:bg-gray-750 hover:border-gray-600 transition-all cursor-pointer"
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{group.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{group.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{group.members.toLocaleString()} members</span>
                      <span className="text-green-400">{group.onlineMembers} online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">{group.lastActive}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinGroup(group.id);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      group.joined
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {group.joined ? 'Joined' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Chat/Details */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Group Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedGroup.image}
                  alt={selectedGroup.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="font-semibold text-white">{selectedGroup.name}</h2>
                  <p className="text-sm text-gray-400">{selectedGroup.members.toLocaleString()} members, <span className="text-green-400">{selectedGroup.onlineMembers} online</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700">
                    <Search className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700">
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full">Today</span>
              </div>
              {sampleMessages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-100">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700">
                  <Mic className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Community</h3>
              <p className="text-gray-400">Choose a community from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;