import React, { useEffect } from 'react';
import { Users, MessageCircle, Bell } from 'lucide-react';
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
}

const initialNetworkGroups: NetworkGroup[] = [
  {
    id: 'sme-network',
    name: 'SME Network',
    description: 'Connect with fellow small and medium enterprise owners to share experiences and opportunities',
    members: 2547,
    lastActive: '2 min ago',
    unreadMessages: 12,
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'finance-network',
    name: 'Finance Professionals Network',
    description: 'Discussion group for finance professionals to share insights and best practices',
    members: 1893,
    lastActive: '5 min ago',
    unreadMessages: 8,
    image: 'https://images.pexels.com/photos/7567473/pexels-photo-7567473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'managers-network',
    name: 'Managers Network',
    description: 'Leadership and management discussions for experienced managers',
    members: 2156,
    lastActive: 'Just now',
    unreadMessages: 15,
    image: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'techies-network',
    name: 'Techies Network',
    description: 'Tech professionals sharing knowledge and discussing latest trends',
    members: 3102,
    lastActive: '1 min ago',
    unreadMessages: 23,
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'lawyers-network',
    name: 'Lawyers Network',
    description: 'Legal professionals discussing industry trends and sharing expertise',
    members: 1456,
    lastActive: '10 min ago',
    unreadMessages: 5,
    image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'marketers-network',
    name: 'Marketers Network',
    description: 'Marketing professionals sharing strategies and industry insights',
    members: 2789,
    lastActive: '3 min ago',
    unreadMessages: 17,
    image: 'https://images.pexels.com/photos/1447418/pexels-photo-1447418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 'job-hunting',
    name: 'Job Hunting Help Group',
    description: 'Support and resources for job seekers across all industries',
    members: 4231,
    lastActive: 'Just now',
    unreadMessages: 31,
    image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
];

const CommunityPage: React.FC = () => {
  const [groups, setGroups] = React.useState<NetworkGroup[]>([]);

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
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group =>
        group.id === groupId
          ? { ...group, joined: !group.joined, members: group.joined ? group.members - 1 : group.members + 1 }
          : group
      );

      // Update localStorage with joined group IDs
      const joinedGroupIds = updatedGroups
        .filter(group => group.joined)
        .map(group => group.id);
      localStorage.setItem('joinedGroups', JSON.stringify(joinedGroupIds));

      return updatedGroups;
    });
  };

  return (
    <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Community Networks</h1>
        <p className="text-gray-400 text-lg">
          Join professional networks, connect with peers, and grow together.
        </p>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            {/* Group Header */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-white font-semibold text-lg break-words">{group.name}</h3>
                    <span className="text-gray-400 text-sm flex-shrink-0">{group.lastActive}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2 break-words">
                    {group.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Group Stats & Actions */}
            <div className="border-t border-gray-700 p-4 sm:p-6 bg-gray-800/50">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center justify-center text-gray-300 text-sm bg-gray-700/50 px-3 py-2 rounded-lg">
                  <Users className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{group.members.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-center text-gray-300 text-sm bg-gray-700/50 px-3 py-2 rounded-lg">
                  <MessageCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="truncate">Active</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {group.joined && (
                  <Link
                    href={`/community/chat/${group.id}`}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors text-center flex items-center justify-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Chat</span>
                    {group.unreadMessages && (
                      <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                        {group.unreadMessages}
                      </span>
                    )}
                  </Link>
                )}
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                    group.joined
                      ? 'bg-gray-600 text-white hover:bg-gray-500'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  <span className="truncate">{group.joined ? 'Leave Group' : 'Join Group'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Join Community Banner */}
      <div className="mt-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h2 className="text-white text-2xl font-bold mb-2">Stay Connected</h2>
            <p className="text-red-100">
              Get notified about new discussions and community events.
            </p>
          </div>
          <button className="w-full sm:w-auto bg-white text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center">
            <Bell className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="truncate">Enable Notifications</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;