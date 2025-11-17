import React, { useState } from 'react';
import { DOMAINS, LEARNING_STYLES, STUDY_TIMES, TEAM_PREFERENCES, AVATAR_OPTIONS, getAvatarUrl } from '../constants.js';
import { apiLogin, apiRegister } from '../services/apiService.js';

// --- VALIDATION RULES ---
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordErrorMsg =
  'Password must be 8+ chars with at least one uppercase, one lowercase, and one number.';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailErrorMsg = 'Please enter a valid email address.';
// --- END RULES ---


const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

const AuthScreen = ({ onLoginSuccess, theme, toggleTheme }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    username: '', password: '', name: '', email: '', 
    domains: [], learningStyle: LEARNING_STYLES[0], 
    studyTime: STUDY_TIMES[0], teamPref: TEAM_PREFERENCES[0], 
    avatarId: AVATAR_OPTIONS[0].id 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleDomainChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({...prev, domains: checked ? [...prev.domains, value] : prev.domains.filter(d => d !== value)}));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLoginView) {
        // --- LOGIN LOGIC ---
        if (!formData.email) {
            setError("Please enter your email.");
            setIsLoading(false);
            return;
        }
        // --- FIXED: Pass formData.email to apiLogin ---
        const userData = await apiLogin(formData.email, formData.password);
        onLoginSuccess(userData); // Pass real user data up to App.jsx

      } else {
        // --- SIGNUP LOGIC ---
        if (step === 2) {
          const userData = await apiRegister(formData);
          onLoginSuccess(userData); // Pass real user data up to App.jsx
        }
      }
    } catch (err) {
      // If apiFetch throws an error, we catch it here
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleViewToggle = (isLogin) => {
    setIsLoginView(isLogin);
    setStep(1); 
    setError(null); // Clear errors on view toggle
  };

  // --- FIXED: All validation is inside this function ---
  const nextStep = () => {
    // 1. Check for empty fields
    if (!formData.name || !formData.email || !formData.username || !formData.password) {
        setError("Please fill out all account fields.");
        return;
    }

    // 2. Check email format
    if (!emailRegex.test(formData.email)) {
      setError(emailErrorMsg);
      return;
    }

    // 3. Check password strength
    if (!passwordRegex.test(formData.password)) {
      setError(passwordErrorMsg);
      return; // Stop the user from proceeding
    }
    
    // 4. All checks passed
    setError(null);
    setStep(prev => prev + 1);
  }
  
  const prevStep = () => setStep(prev => prev - 1);

  const formInputClass = "mt-1 w-full p-2.5 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-lg outline-none text-gray-800 dark:text-gray-200 transition-colors";
  const formLabelClass = "text-sm font-medium text-gray-700 dark:text-gray-300";
  const buttonClass = "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:opacity-75 disabled:scale-100";
  const secondaryButtonClass = "w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:bg-gray-300 disabled:opacity-75 disabled:scale-100";


  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 overflow-y-auto relative">
      
      <button 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">StudyMate</h1><p className="text-gray-600 dark:text-gray-300 mt-2">Find your perfect study partner.</p></div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button onClick={() => handleViewToggle(true)} className={`flex-1 py-3 text-sm font-semibold transition-colors ${isLoginView ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>Login</button>
                <button onClick={() => handleViewToggle(false)} className={`flex-1 py-3 text-sm font-semibold transition-colors ${!isLoginView ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>Sign Up</button>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLoginView && (
              <div className="text-center mb-4">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Step {step} of 2: {step === 1 ? 'Account Details' : 'Profile Setup'}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div className={`bg-blue-600 h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                </div>
              </div>
            )}

            {/* Password Hint */}
            {!isLoginView && step === 1 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-200">
                  {passwordErrorMsg}
                </p>
              </div>
            )}
            
            {/* Error Message Display */}
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-center">
                <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className={formLabelClass}>Email</label>
              <input 
                type="email" 
                name="email" // --- FIXED: Always 'email' ---
                id="email" 
                onChange={handleInputChange} 
                className={formInputClass} 
                required 
                placeholder="your@email.com"
              />
            </div>
            
            {/* Show Username field only on signup step 1 */}
            {!isLoginView && step === 1 && (
               <div>
                  <label htmlFor="username-signup" className={formLabelClass}>Username</label>
                  <input type="text" name="username" id="username-signup" onChange={handleInputChange} className={formInputClass} placeholder="e.g., codeMaster" required />
                </div>
            )}

            <div>
              <label htmlFor="password" className={formLabelClass}>Password</label>
              <input type="password" name="password" id="password" onChange={handleInputChange} className={formInputClass} required />
            </div>

            {isLoginView && (
              <button type="submit" className={buttonClass} disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            )}
            
            {!isLoginView && step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                    <label className={formLabelClass}>Choose your Avatar</label>
                    <div className="mt-2 flex justify-center mb-4">
                        <img src={getAvatarUrl(formData.avatarId)} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover shadow-lg"/>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {AVATAR_OPTIONS.map(avatar => (
                            <button
                                type="button"
                                key={avatar.id}
                                onClick={() => setFormData(prev => ({ ...prev, avatarId: avatar.id }))}
                                className={`rounded-full overflow-hidden transition-all transform hover:scale-110 ${formData.avatarId === avatar.id ? 'ring-4 ring-blue-500' : 'ring-2 ring-transparent'}`}
                            >
                                <img src={avatar.url} alt={`Avatar ${avatar.id}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                  <label htmlFor="name" className={formLabelClass}>Name</label>
                  <input type="text" name="name" id="name" onChange={handleInputChange} className={formInputClass} required />
                </div>
                
                <button type="button" onClick={nextStep} className={buttonClass} disabled={isLoading}>
                  Next
                </button>
              </div>
            )}

            {!isLoginView && step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className={formLabelClass}>Interested Domains</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">{DOMAINS.map(domain => <label key={domain} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"><input type="checkbox" value={domain} onChange={handleDomainChange} className="rounded text-blue-500 focus:ring-blue-500" /><span>{domain}</span></label>)}</div>
                </div>
                 <div>
                    <label htmlFor="learningStyle" className={formLabelClass}>Learning Style</label>
                    <select name="learningStyle" id="learningStyle" onChange={handleInputChange} value={formData.learningStyle} className={formInputClass}>{LEARNING_STYLES.map(style => <option key={style} value={style}>{style}</option>)}</select>
                </div>
                <div>
                    <label htmlFor="studyTime" className={formLabelClass}>Study Time Preference</label>
                    <select name="studyTime" id="studyTime" onChange={handleInputChange} value={formData.studyTime} className={formInputClass}>{STUDY_TIMES.map(time => <option key={time} value={time}>{time}</option>)}</select>
                </div>
                <div>
                    <label className={formLabelClass}>Team or Solo Preference</label>
                    <div className="mt-2 flex items-center space-x-6">{TEAM_PREFERENCES.map(pref => <label key={pref} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"><input type="radio" name="teamPref" value={pref} checked={formData.teamPref === pref} onChange={handleInputChange} className="text-blue-500 focus:ring-blue-5g00" /><span>{pref}</span></label>)}</div>
                </div>
                
                <div className="flex gap-x-4 pt-2">
                  <button type="button" onClick={prevStep} className={secondaryButtonClass} disabled={isLoading}>Back</button>
                  <button type="submit" className={buttonClass} disabled={isLoading}>
                    {isLoading ? 'Signing up...' : 'Sign Up'}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;