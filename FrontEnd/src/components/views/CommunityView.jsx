import React, { useState, useEffect, useRef } from 'react';
import { getAvatarUrl } from '../../constants.js';
import { SearchIcon, MembersIcon, ChatBubbleIcon, EllipsisIcon, LeaveIcon, JoinIcon } from '../Icons.jsx';
import { 
  joinRoom, 
  leaveRoom, 
  sendMessage, 
  onMessageReceived, 
  offMessageReceived 
} from '../../services/socketService.js';
import { 
  apiGetGroupMessages,
  apiGetAllGroups,
  apiGetMyGroups,
  apiJoinGroup,
  apiLeaveGroup,
  apiGetGroupMembers,
} from '../../services/apiService.js';
import ChatBubble from '../ChatBubble.jsx';


const GroupListView = ({ groups, onSelectGroup, onSearchChange }) => (
  <div className="space-y-4">
    {}
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input
        type="text"
        placeholder="Search groups..."
        onChange={onSearchChange}
        className="w-full p-3 pl-12 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map(group => (
        <button
          key={group._id}
          onClick={() => onSelectGroup(group)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden text-left transition-transform transform hover:scale-105"
        >
          <img src={group.bannerImage} alt={group.name} className="w-full h-24 object-cover" />
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{group.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">{group.description}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-3 block">{group.memberCount} members</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);


const GroupDetailView = ({ group, onGoBack, onViewProfile, isJoined, onJoin, onLeave, user }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  
  const messagesEndRef = useRef(null);
  
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  
  useEffect(() => {
    if(isJoined) {
      setActiveTab('chat');
    }
  }, [isJoined]);

  
  useEffect(() => {
    
    const handleReceiveMessage = (messageData) => {
      if (messageData.group === group._id) {
        setMessages(prev => [...prev, messageData]);
      }
    };
    
    if (isJoined) {
      if (activeTab === 'chat') {
        setIsLoadingChat(true);
        apiGetGroupMessages(group._id)
          .then(setMessages)
          .catch(err => console.error("Failed to load history", err))
          .finally(() => setIsLoadingChat(false));
        
        joinRoom(group._id);
        onMessageReceived(handleReceiveMessage); 

        return () => {
          leaveRoom(group._id);
          offMessageReceived();
        };
      } else if (activeTab === 'members') {
        setIsLoadingMembers(true);
        apiGetGroupMembers(group._id)
          .then(setMembers)
          .catch(err => console.error("Failed to load members", err))
          .finally(() => setIsLoadingMembers(false));
      }
    } else {
      setMessages([]);
      setMembers([]);
      setIsLoadingChat(false);
      setIsLoadingMembers(false);
    }
  }, [isJoined, activeTab, group._id]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  
  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const ownMessageData = {
      _id: new Date().getTime(),
      text: newMessage,
      createdAt: new Date(),
      group: group._id, 
      sender: {
        _id: user._id, 
        name: user.name, 
        avatarId: user.avatarId 
      },
    };
    
    setMessages(prev => [...prev, ownMessageData]);
    
    sendMessage(group._id, newMessage, true); 
    setNewMessage('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-800">
      {}
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <button onClick={onGoBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img src={group.bannerImage} alt={group.name} className="w-10 h-10 rounded-lg object-cover ml-3" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white ml-3">{group.name}</h2>
        
        {}
        <div className="ml-auto relative" ref={menuRef}>
          {isJoined ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <EllipsisIcon />
            </button>
          ) : (
            <button
              onClick={onJoin}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              <JoinIcon />
              <span>Join</span>
            </button>
          )}
          {isJoined && menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => { onLeave(); setMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LeaveIcon /> <span>Leave Group</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {}
      {isJoined ? (
        <>
          {}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex justify-center items-center space-x-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'chat' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <ChatBubbleIcon active={activeTab === 'chat'} />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 flex justify-center items-center space-x-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'members' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <MembersIcon active={activeTab === 'members'} />
              <span>Members ({group.memberCount})</span>
            </button>
          </div>

          {}
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'chat' && (
              isLoadingChat ? (
                <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
              ) : (
                <>
                  {messages.length === 0 && <div className="text-center text-gray-500 dark:text-gray-400 p-4">Be the first to say something in {group.name}!</div>}
                  {messages.map((msg) => (
                    <ChatBubble 
                      key={msg._id} 
                      message={msg} 
                      
                      isSender={user && msg.sender && msg.sender._id === user._id} 
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )
            )}
            {activeTab === 'members' && (
              isLoadingMembers ? (
                <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
              ) : (
                <div className="space-y-1">
                  {members.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 p-4">No members found.</p>}
                  {members.map(memberUser => (
                    <button
                      key={memberUser._id}
                      onClick={() => onViewProfile(memberUser._id)}
                      className="flex items-center w-full text-left p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img src={getAvatarUrl(memberUser.avatarId)} alt={memberUser.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{memberUser.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
          </main>

          {}
          {activeTab === 'chat' && (
            <footer className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSend} className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-full outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700" 
                />
                <button type="submit" className="ml-3 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
              </form>
            </footer>
          )}
        </>
      ) : (
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">About this group</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{group.description}</p>
          </div>
        </main>
      )}
    </div>
  );
};



const CommunityView = ({ onViewProfile, user, initialGroupId, onGroupOpened }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [allGroups, setAllGroups] = useState([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState(new Set());
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); 

  
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [allGroupsData, myGroupsData] = await Promise.all([
        apiGetAllGroups(),
        apiGetMyGroups()
      ]);
      
      setAllGroups(allGroupsData);
      setJoinedGroupIds(new Set(myGroupsData.map(g => g._id)));
    } catch (error) {
      console.error("Failed to load community data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  
  useEffect(() => {
    if (initialGroupId && allGroups.length > 0) {
      const groupToOpen = allGroups.find(g => g._id === initialGroupId);
      if (groupToOpen) {
        setSelectedGroup(groupToOpen);
        
        if (onGroupOpened) onGroupOpened();
      }
    }
  }, [initialGroupId, allGroups, onGroupOpened]);

  const handleJoin = async () => {
    try {
      const { memberCount } = await apiJoinGroup(selectedGroup._id);
      setJoinedGroupIds(prev => new Set(prev).add(selectedGroup._id));
      setSelectedGroup(prev => ({ ...prev, memberCount }));
      setAllGroups(prev => prev.map(g => g._id === selectedGroup._id ? { ...g, memberCount } : g));
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  };
  
  const handleLeave = async () => {
    try {
      const { memberCount } = await apiLeaveGroup(selectedGroup._id);
      setJoinedGroupIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedGroup._id);
        return newSet;
      });
      setSelectedGroup(prev => ({ ...prev, memberCount }));
      setAllGroups(prev => prev.map(g => g._id === selectedGroup._id ? { ...g, memberCount } : g));
    } catch (error) {
      console.error("Failed to leave group:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredGroups = allGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm)
  );

  if (selectedGroup) {
    return (
      <GroupDetailView
        group={selectedGroup}
        onGoBack={() => setSelectedGroup(null)}
        onViewProfile={onViewProfile}
        isJoined={joinedGroupIds.has(selectedGroup._id)}
        onJoin={handleJoin}
        onLeave={handleLeave}
        user={user} 
      />
    );
  }

  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
      ) : error ? (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
           <h3 className="text-xl font-bold text-red-500">An Error Occurred</h3>
           <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">{error}</p>
        </div>
      ) : allGroups.length === 0 ? (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">No Groups Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
            There are no community groups available. (This may be because the database seeder hasn't run.)
          </p>
        </div>
      ) : (
        <GroupListView
          groups={filteredGroups}
          onSelectGroup={setSelectedGroup}
          onSearchChange={handleSearchChange}
        />
      )}
    </div>
  );
};

export default CommunityView;