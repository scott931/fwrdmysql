import React, { useEffect, useState } from 'react';
import { Users, MessageCircle, Bell, Search, Settings, BookOpen, Calendar, Folder, Star, Plus, MoreHorizontal, Phone, Video, Send, Mic, Menu, X, TrendingUp, Users2, Sparkles, Hash, Globe, Shield, Crown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

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
  isVerified?: boolean;
  isPremium?: boolean;
  tags?: string[];
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  avatar: string;
  isVerified?: boolean;
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
    category: 'Business',
    isVerified: true,
    isPremium: true,
    tags: ['Business', 'Networking', 'Verified']
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
    category: 'Finance',
    isVerified: true,
    tags: ['Finance', 'Professional', 'Verified']
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
    category: 'Leadership',
    isPremium: true,
    tags: ['Leadership', 'Management', 'Premium']
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
    category: 'Technology',
    isVerified: true,
    tags: ['Technology', 'Innovation', 'Verified']
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
    category: 'Legal',
    tags: ['Legal', 'Professional']
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
    category: 'Marketing',
    isPremium: true,
    tags: ['Marketing', 'Strategy', 'Premium']
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
    category: 'Career',
    isVerified: true,
    tags: ['Career', 'Job Search', 'Verified']
  },
];

const sampleMessages: Message[] = [
  {
    id: '1',
    content: 'Has anyone tried the new business registration process in Kenya?',
    sender: 'Sarah Johnson',
    timestamp: '10:30 AM',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    isVerified: true
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
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    isVerified: true
  }
];

const CommunityPage: React.FC = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<NetworkGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<NetworkGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'work' | 'personal' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleJoinGroup = async (groupId: string) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

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

    setIsLoading(false);
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const handleGroupSelect = (group: NetworkGroup) => {
    // Set the selected group to show chat inline instead of navigating
    setSelectedGroup(group);
    
    // On mobile, open the chat panel
    if (window.innerWidth < 1024) {
      setChatOpen(true);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'all': return <Globe className="h-5 w-5" />;
      case 'joined': return <Users2 className="h-5 w-5" />;
      case 'work': return <BookOpen className="h-5 w-5" />;
      case 'personal': return <Users className="h-5 w-5" />;
      case 'saved': return <Star className="h-5 w-5" />;
      default: return <MessageCircle className="h-5 w-5" />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'all': return 'All Communities';
      case 'joined': return 'My Communities';
      case 'work': return 'Work';
      case 'personal': return 'Personal';
      case 'saved': return 'Saved';
      default: return 'All';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-red-400" />
            <h1 className="text-xl font-bold text-white">Communities</h1>
          </div>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Toggle chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Navigation */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700/50 flex flex-col transition-all duration-300 ease-in-out lg:transition-none shadow-2xl`}>
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">JD</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">John Doe</p>
                <p className="text-sm text-green-400 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Online
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-red-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
                aria-label="Search communities"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {(['all', 'joined', 'work', 'personal', 'saved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                  aria-label={`Show ${getTabLabel(tab).toLowerCase()}`}
                >
                  <div className={`transition-all duration-200 ${activeTab === tab ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {getTabIcon(tab)}
                  </div>
                  <span className="font-medium">{getTabLabel(tab)}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings */}
          <div className="p-4 border-t border-gray-700/50">
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 group"
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* Center Column - Groups List */}
        <div className="flex-1 flex flex-col bg-transparent">
          {/* Header */}
          <div className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Sparkles className="h-6 w-6 text-red-400" />
                  <h1 className="text-2xl font-bold text-white">Communities</h1>
                </div>
                <p className="text-gray-400">{filteredGroups.length} communities available</p>
              </div>
              <button
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105"
                aria-label="Create new community"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Create Community</span>
              </button>
            </div>
          </div>

          {/* Groups Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No communities found</h3>
                <p className="text-gray-400 max-w-md">Try adjusting your search terms or browse all communities</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl hover:shadow-black/20"
                    onClick={() => handleGroupSelect(group)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleGroupSelect(group);
                      }
                    }}
                    aria-label={`Select ${group.name} community`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-700 shadow-lg">
                          <Image
                            src={group.image}
                            alt={group.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="64px"
                          />
                        </div>
                        {group.isVerified && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <Shield className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {group.isPremium && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <Crown className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-white text-lg truncate">{group.name}</h3>
                          {group.isVerified && (
                            <Shield className="h-4 w-4 text-blue-400" />
                          )}
                          {group.isPremium && (
                            <Crown className="h-4 w-4 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{group.description}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {group.tags?.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Users2 className="h-3 w-3" />
                              <span>{group.members.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-green-400">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span>{group.onlineMembers}</span>
                            </span>
                          </div>
                          <span>{group.lastActive}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                      {group.unreadMessages && group.unreadMessages > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-400">{group.unreadMessages} new</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinGroup(group.id);
                        }}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                          group.joined
                            ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label={group.joined ? `Leave ${group.name}` : `Join ${group.name}`}
                      >
                        {isLoading ? '...' : (group.joined ? 'Joined' : 'Join')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Chat/Details */}
        <div className={`${chatOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 right-0 z-50 w-80 bg-gray-800/95 backdrop-blur-sm border-l border-gray-700/50 flex flex-col transition-all duration-300 ease-in-out lg:transition-none shadow-2xl`}>
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setChatOpen(false)}
              className="text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="Close chat"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {selectedGroup ? (
            <>
              {/* Group Header */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-700 shadow-lg">
                      <Image
                        src={selectedGroup.image}
                        alt={selectedGroup.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    {selectedGroup.isVerified && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-white text-lg">{selectedGroup.name}</h2>
                    <p className="text-sm text-gray-400">
                      {selectedGroup.members.toLocaleString()} members,
                      <span className="text-green-400 ml-1">{selectedGroup.onlineMembers} online</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200" aria-label="Search in chat">
                      <Search className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200" aria-label="Voice call">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200" aria-label="Video call">
                      <Video className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200" aria-label="More options">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="text-center">
                  <span className="text-xs text-gray-500 bg-gray-700/50 px-3 py-1 rounded-full">Today</span>
                </div>
                {sampleMessages.map((message) => (
                  <div key={message.id} className="flex space-x-3 group">
                    <div className="relative">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 shadow-lg">
                        <Image
                          src={message.avatar}
                          alt={message.sender}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      {message.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Shield className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm font-medium text-white">{message.sender}</p>
                          {message.isVerified && (
                            <Shield className="h-3 w-3 text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-100">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-700/50">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <button type="button" className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200" aria-label="Voice message">
                    <Mic className="h-4 w-4" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-400 transition-all duration-200"
                      aria-label="Message input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Select a Community</h3>
                <p className="text-gray-400 max-w-sm">Choose a community from the list to start chatting and networking with fellow professionals</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {(sidebarOpen || chatOpen) && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => {
            setSidebarOpen(false);
            setChatOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CommunityPage;