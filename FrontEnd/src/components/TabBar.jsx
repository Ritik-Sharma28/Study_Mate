

import React from 'react';
import { CommunityIcon, PostsIcon, PartnerIcon, ProfileIcon } from './Icons.jsx';

const TabBar = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'posts', icon: PostsIcon, label: 'Posts' },
        { id: 'findPartner', icon: PartnerIcon, label: 'Partners' },
        { id: 'community', icon: CommunityIcon, label: 'Community' },
        { id: 'profile', icon: ProfileIcon, label: 'Profile' },
    ];
    return (
        <div className="flex justify-around bg-white/70 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700/50 p-2 backdrop-blur-sm mt-auto">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex flex-col items-center justify-center w-full p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                    <tab.icon active={activeTab === tab.id} />
                    <span className={`text-xs mt-1 transition-colors ${activeTab === tab.id ? 'text-blue-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default TabBar;