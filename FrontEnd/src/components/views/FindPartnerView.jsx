import React, { useState } from 'react';
import { SUGGESTED_USERS, SKILLS, STUDY_TIMES, TEAM_PREFERENCES } from '../../constants.js';
import { DmIcon } from '../Icons.jsx';
import { getAvatarUrl } from '../../constants.js';

// --- Helper: A Checkbox component for the UI ---
const SkillCheckbox = ({ label, isChecked, onChange }) => (
  <label className={`flex items-center space-x-2 p-2.5 rounded-lg cursor-pointer transition-colors border-2 ${
      isChecked 
        ? 'bg-blue-50 dark:bg-blue-900 border-blue-500' 
        : 'bg-gray-100 dark:bg-gray-700 border-gray-100 dark:border-gray-700'
  }`}>
    <input 
      type="checkbox" 
      checked={isChecked} 
      onChange={onChange} 
      className="rounded text-blue-500 focus:ring-blue-500" 
    />
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
  </label>
);

const FindPartnerView = ({ onStartChat , onViewProfile }) => {
    const [filters, setFilters] = useState({
      teamPref: TEAM_PREFERENCES[0], // 'Team' or 'Solo'
      studyTime: [],
      skills: []
    });
    
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // To show "No results"

    const USERS_PER_PAGE = 5;

    // --- Filter Handlers ---
    const handleSkillChange = (skill) => {
      setFilters(prev => ({
        ...prev,
        skills: prev.skills.includes(skill) 
          ? prev.skills.filter(s => s !== skill) 
          : [...prev.skills, skill]
      }));
    };

    const handleTimeChange = (time) => {
      setFilters(prev => ({
        ...prev,
        studyTime: prev.studyTime.includes(time) 
          ? prev.studyTime.filter(t => t !== time) 
          : [...prev.studyTime, time]
      }));
    };

    const handlePrefChange = (e) => {
      setFilters(prev => ({ ...prev, teamPref: e.target.value }));
    };

    // --- Search Logic ---
    const handleFindMatches = () => {
        setIsSearching(true);
        setHasSearched(false);
        setResults([]);
        setCurrentPage(1);

        // --- MOCK API CALL ---
        setTimeout(() => {
            const matchedUsers = SUGGESTED_USERS.filter(user => {
              // Note: This is a placeholder. Real logic will be on the backend.
              // For now, we'll just check if they have at least one selected skill.
              const skillMatch = filters.skills.length === 0 
                ? true 
                : filters.skills.some(skill => user.skills.includes(skill));
              
              return skillMatch;
            });
            setResults(matchedUsers);
            setIsSearching(false);
            setHasSearched(true);
        }, 1500);
        // --- END MOCK API CALL ---
    };

    // --- Pagination Logic ---
    const totalPages = Math.ceil(results.length / USERS_PER_PAGE);
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const currentResults = results.slice(startIndex, startIndex + USERS_PER_PAGE);
    
    const goToNextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6">
            
            {/* --- FILTER SECTION --- */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm space-y-5">
              
              {/* Preference */}
              <div>
                <label className="text-lg font-semibold text-gray-800 dark:text-white">I'm looking for a...</label>
                <div className="mt-3 flex gap-4">
                  {TEAM_PREFERENCES.map(pref => (
                    <label key={pref} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="teamPref" 
                        value={pref} 
                        checked={filters.teamPref === pref} 
                        onChange={handlePrefChange} 
                        className="text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="text-gray-700 dark:text-gray-200">
                        {pref === 'Team' ? 'Project Partner' : 'Study Buddy'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Study Time */}
              <div>
                <label className="text-lg font-semibold text-gray-800 dark:text-white">Preferred Study Time</label>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {STUDY_TIMES.map(time => (
                    <SkillCheckbox 
                      key={time}
                      label={time}
                      isChecked={filters.studyTime.includes(time)}
                      onChange={() => handleTimeChange(time)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Skills */}
              <div>
                <label className="text-lg font-semibold text-gray-800 dark:text-white">Skills</label>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SKILLS.map(skill => (
                      <SkillCheckbox 
                        key={skill}
                        label={skill}
                        isChecked={filters.skills.includes(skill)}
                        onChange={() => handleSkillChange(skill)}
                      />
                    ))}
                </div>
              </div>

              {/* Search Button */}
              <button 
                onClick={handleFindMatches} 
                disabled={isSearching} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isSearching ? 'Matching...' : 'Find Matches'}
              </button>
            </div>
            
            {/* --- RESULTS SECTION --- */}
            <div className="space-y-4">
              {isSearching && (
                  <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>
              )}
              
              {!isSearching && hasSearched && results.length === 0 && (
                <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No Matches Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters for better results.</p>
                </div>
              )}

              {currentResults.length > 0 && (
                <div className="space-y-3">
                    {currentResults.map(user => (
                        
                        <div key={user.name} className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <button onClick={() => onViewProfile(user._id)} className="flex items-center text-left flex-1 space-x-4">
                          <img src={getAvatarUrl(user.avatarId)} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                          <div className="flex-1">
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                  {user.skills.map(s => <span key={s} className="text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">{s}</span>)}
                              </div>
                          </div>
                      </button>
                            <button onClick={() => onStartChat(user)} className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                              <DmIcon/>
                            </button>
                        </div>
                    ))}
                </div>
              )}

              {/* Pagination */}
              {results.length > USERS_PER_PAGE && (
                <div className="flex justify-between items-center pt-4">
                  <button 
                    onClick={goToPrevPage} 
                    disabled={currentPage === 1}
                    className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={goToNextPage} 
                    disabled={currentPage === totalPages}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
        </div>
    );
};

export default FindPartnerView;