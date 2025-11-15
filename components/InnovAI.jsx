import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu, Search, Code, Sparkles, X, Download, Settings, Terminal, User, Edit2, Users, Briefcase, Bell, Moon, Sun, Zap, Eye, Globe } from 'lucide-react';

export default function InnovAI() {
  const [screen, setScreen] = useState('cookie');
  const [cookiesAccepted, setCookiesAccepted] = useState(null);
  const [userData, setUserData] = useState({ 
    name: '', 
    username: '',
    age: '', 
    interests: '', 
    bio: '', 
    profileColor: '#84cc16', 
    profilePhoto: '',
    followers: [],
    following: [],
    projects: [],
    settings: {
      theme: 'dark',
      fontSize: 'medium',
      notifications: true,
      showOnlineStatus: true,
      publicProfile: true,
      soundEffects: false,
      compactMode: false,
      showTimestamps: true
    }
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', tags: '' });
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeRequest, setCodeRequest] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const saved = localStorage.getItem('innovai_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          const mergedData = {
            ...parsed,
            settings: {
              theme: 'dark',
              fontSize: 'medium',
              notifications: true,
              showOnlineStatus: true,
              publicProfile: true,
              soundEffects: false,
              compactMode: false,
              showTimestamps: true,
              ...parsed.settings
            }
          };
          setUserData(mergedData);
          setScreen('chat');
          setCookiesAccepted(true);
          loadCommunityData();
        }
      } catch (e) {
        console.error('Storage error:', e);
      }
    };
    checkUserData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadCommunityData = async () => {
    try {
      // Simulate loading community data from localStorage
      const allUsersData = JSON.parse(localStorage.getItem('innovai_all_users') || '[]');
      const allProjectsData = JSON.parse(localStorage.getItem('innovai_all_projects') || '[]');
      
      setAllUsers(allUsersData);
      setAllProjects(allProjectsData);
    } catch (e) {
      console.error('Error loading community data:', e);
      setAllUsers([]);
      setAllProjects([]);
    }
  };

  const handleCookies = async (accepted) => {
    setCookiesAccepted(accepted);
    if (accepted) {
      setScreen('personalization');
    } else {
      setScreen('chat');
    }
  };

  const handlePersonalization = async () => {
    if (!userData.name || !userData.username || !userData.age || !userData.interests) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (cookiesAccepted) {
      try {
        localStorage.setItem('innovai_user', JSON.stringify(userData));
        const existingUsers = JSON.parse(localStorage.getItem('innovai_all_users') || '[]');
        const userProfile = {
          name: userData.name,
          username: userData.username,
          bio: userData.bio || '',
          profilePhoto: userData.profilePhoto || '',
          profileColor: userData.profileColor,
          interests: userData.interests,
          followers: userData.followers || [],
          following: userData.following || [],
          settings: userData.settings || {}
        };
        const updatedUsers = existingUsers.filter(u => u.username !== userData.username);
        updatedUsers.push(userProfile);
        localStorage.setItem('innovai_all_users', JSON.stringify(updatedUsers));
      } catch (e) {
        console.error('Storage error:', e);
      }
    }
    
    setScreen('chat');
    setMessages([{
      role: 'assistant',
      content: `Welcome ${userData.name} (@${userData.username})! I'm InnovAI, your lightning-fast AI assistant for developers. I see you're interested in ${userData.interests}. How can I help you code today?`
    }]);
    loadCommunityData();
  };

  const saveUserData = async (newData) => {
    setUserData(newData);
    if (cookiesAccepted) {
      try {
        localStorage.setItem('innovai_user', JSON.stringify(newData));
        const existingUsers = JSON.parse(localStorage.getItem('innovai_all_users') || '[]');
        const userProfile = {
          name: newData.name,
          username: newData.username,
          bio: newData.bio || '',
          profilePhoto: newData.profilePhoto || '',
          profileColor: newData.profileColor,
          interests: newData.interests,
          followers: newData.followers || [],
          following: newData.following || [],
          settings: newData.settings || {}
        };
        const updatedUsers = existingUsers.filter(u => u.username !== newData.username);
        updatedUsers.push(userProfile);
        localStorage.setItem('innovai_all_users', JSON.stringify(updatedUsers));
      } catch (e) {
        console.error('Storage error:', e);
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserData({ ...userData, profilePhoto: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFollow = async (username) => {
    const newFollowing = [...(userData.following || [])];
    if (newFollowing.includes(username)) {
      const index = newFollowing.indexOf(username);
      newFollowing.splice(index, 1);
    } else {
      newFollowing.push(username);
    }
    const newData = { ...userData, following: newFollowing };
    await saveUserData(newData);
    await loadCommunityData();
  };

  const createProject = async (projectData) => {
    try {
      const projectId = `project:${Date.now()}_${userData.username}`;
      const project = {
        id: projectId,
        ...projectData,
        creator: userData.username,
        createdAt: new Date().toISOString(),
        members: [userData.username],
        status: 'active'
      };
      const existingProjects = JSON.parse(localStorage.getItem('innovai_all_projects') || '[]');
      existingProjects.push(project);
      localStorage.setItem('innovai_all_projects', JSON.stringify(existingProjects));
      await loadCommunityData();
      return true;
    } catch (e) {
      console.error('Error creating project:', e);
      return false;
    }
  };

  const downloadChat = () => {
    const chatText = messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `innovai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {

      const context = userData.name 
        ? `User Profile: Name: ${userData.name}, Username: @${userData.username}, Age: ${userData.age}, Interests: ${userData.interests}, Bio: ${userData.bio || 'N/A'}. Use this information to personalize your responses and relate to their interests. `
        : '';
      
      const needsSearch = input.toLowerCase().includes('search') || 
                         input.toLowerCase().includes('latest') ||
                         input.toLowerCase().includes('current') ||
                         input.toLowerCase().includes('news') ||
                         input.toLowerCase().includes('web');

      let systemPrompt = `${context}You are InnovAI, an elite AI assistant for developers. You respond FAST and CONCISE. You specialize in coding, development, and technical topics. Be direct, efficient, and helpful. When providing code, use proper syntax. You can search the web when needed. IMPORTANT: When you know the user's interests, try to relate your responses to those interests when relevant, and use their name occasionally to make the conversation more personal.`;

      // Send the request to our server-side endpoint that stores the secret key
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          tools: needsSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Server Error (${response.status}): ${errorData.error?.message || response.statusText || 'Unknown error'}`);
      }

      const data = await response.json();

      let fullResponse = '';
      if (data.error) {
        fullResponse = `API Error: ${data.error.message || 'Unknown error'}`;
      } else if (data.content) {
        for (const block of data.content) {
          if (block.type === 'text') {
            fullResponse += block.text;
          }
        }
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: fullResponse || 'I encountered an error processing your request.'
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message || 'Unable to process request. Please try again.'}`
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Cookie Screen
  if (screen === 'cookie') {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-lime-400">InnovAI</h1>
              <p className="text-xs text-zinc-400">DEVELOPER</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-3">Cookie Consent</h2>
          <p className="text-zinc-400 mb-6 text-sm">
            We use cookies to save your preferences and provide a personalized experience. 
            This helps us remember your profile and connect you with the developer community.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleCookies(true)}
              className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-semibold py-3 rounded-lg transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleCookies(false)}
              className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-semibold py-3 rounded-lg transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Personalization Screen
  if (screen === 'personalization') {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 border border-zinc-800 my-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-lime-400">InnovAI</h1>
              <p className="text-xs text-zinc-400">DEVELOPER</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Create Your Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Name *</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Username *</label>
              <input
                type="text"
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors"
                placeholder="username_here"
              />
              <p className="text-xs text-zinc-500 mt-1">Letters, numbers, and underscores only</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Age *</label>
              <input
                type="number"
                value={userData.age}
                onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors"
                placeholder="Enter your age"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Interests *</label>
              <input
                type="text"
                value={userData.interests}
                onChange={(e) => setUserData({ ...userData, interests: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors"
                placeholder="e.g., React, Python, Machine Learning"
              />
              <p className="text-xs text-zinc-500 mt-1">Separate interests by comma</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Bio (Optional)</label>
              <textarea
                value={userData.bio}
                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors resize-none"
                placeholder="Tell us about yourself..."
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Profile Color</label>
              <div className="flex gap-2">
                {['#84cc16', '#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899'].map(color => (
                  <button
                    key={color}
                    onClick={() => setUserData({ ...userData, profileColor: color })}
                    className={`w-10 h-10 rounded-lg transition-all ${userData.profileColor === color ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Profile Photo (Optional)</label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden"
                  style={{ backgroundColor: userData.profilePhoto ? 'transparent' : userData.profileColor }}
                >
                  {userData.profilePhoto ? (
                    <img src={userData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userData.name ? userData.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload-initial"
                  />
                  <label
                    htmlFor="photo-upload-initial"
                    className="cursor-pointer inline-block bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Upload Photo
                  </label>
                  {userData.profilePhoto && (
                    <button
                      onClick={() => setUserData({ ...userData, profilePhoto: '' })}
                      className="ml-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handlePersonalization}
            className="w-full mt-6 bg-lime-500 hover:bg-lime-600 text-black font-semibold py-3 rounded-lg transition-colors"
          >
            Join InnovAI Community
          </button>
        </div>
      </div>
    );
  }

  // Chat Screen
  return (
    <div className="h-screen bg-black text-white flex flex-col relative">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-lime-400">InnovAI</h1>
              <p className="text-xs text-zinc-400">DEVELOPER</p>
            </div>
            {userData.settings?.showOnlineStatus && (
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-500">1 online</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCommunity(true)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowProjects(true)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Briefcase className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowProfile(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
              style={{ backgroundColor: userData.profilePhoto ? 'transparent' : userData.profileColor + '20' }}
            >
              {userData.profilePhoto ? (
                <img src={userData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" style={{ color: userData.profileColor }} />
              )}
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-16 right-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-64 z-50">
          <div className="p-2">
            <button
              onClick={downloadChat}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 rounded-lg transition-colors text-left"
            >
              <Download className="w-5 h-5 text-lime-400" />
              <span>Download Chat</span>
            </button>
            <button
              onClick={() => {
                setShowCustomization(true);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 rounded-lg transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-lime-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                window.open('https://github.com/innovai/code', '_blank');
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 rounded-lg transition-colors text-left"
            >
              <Terminal className="w-5 h-5 text-lime-400" />
              <span>InnovAI Code</span>
            </button>
          </div>
        </div>
      )}

      {/* Community Modal */}
      {showCommunity && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold">Developer Community</h2>
                <p className="text-sm text-zinc-400">{allUsers.length} developers online</p>
              </div>
              <button
                onClick={() => setShowCommunity(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-zinc-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search developers..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {allUsers
                  .filter(user => 
                    user.username !== userData.username &&
                    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     user.username?.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((user, idx) => (
                    <div key={idx} className="bg-zinc-800 rounded-lg p-4 flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: user.profilePhoto ? 'transparent' : user.profileColor }}
                      >
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{user.name}</h3>
                        <p className="text-sm text-zinc-400">@{user.username}</p>
                        {user.bio && <p className="text-xs text-zinc-500 mt-1 truncate">{user.bio}</p>}
                      </div>
                      <button
                        onClick={() => handleFollow(user.username)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex-shrink-0 ${
                          (userData.following || []).includes(user.username)
                            ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                            : 'bg-lime-500 hover:bg-lime-600 text-black'
                        }`}
                      >
                        {(userData.following || []).includes(user.username) ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))}
                {allUsers.filter(u => u.username !== userData.username).length === 0 && (
                  <div className="text-center text-zinc-500 py-8">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No other developers yet. Be the first!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Modal */}
      {showProjects && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold">Projects</h2>
                <p className="text-sm text-zinc-400">{allProjects.length} active projects</p>
              </div>
              <button
                onClick={() => setShowProjects(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-zinc-800">
              <button
                onClick={async () => {
                  const projectName = prompt('Project Name:');
                  const projectDesc = prompt('Project Description:');
                  if (projectName && projectDesc) {
                    await createProject({ name: projectName, description: projectDesc });
                  }
                }}
                className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 rounded-lg transition-colors"
              >
                + Create New Project
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {allProjects.map((project, idx) => (
                  <div key={idx} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <p className="text-sm text-zinc-400">by @{project.creator}</p>
                      </div>
                      <span className="px-2 py-1 bg-lime-500/20 text-lime-400 text-xs rounded">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-3">{project.description}</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-zinc-500" />
                      <span className="text-xs text-zinc-500">{(project.members || []).length} members</span>
                    </div>
                  </div>
                ))}
                {allProjects.length === 0 && (
                  <div className="text-center text-zinc-500 py-8">
                    <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No projects yet. Create the first one!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden"
                style={{ backgroundColor: userData.profilePhoto ? 'transparent' : userData.profileColor }}
              >
                {userData.profilePhoto ? (
                  <img src={userData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userData.name ? userData.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <h3 className="text-2xl font-bold">{userData.name || 'User'}</h3>
              <p className="text-zinc-400">@{userData.username}</p>
              <p className="text-sm text-zinc-500">{userData.age ? `${userData.age} years old` : 'Age not set'}</p>
            </div>

            {userData.bio && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-zinc-400 mb-2">Bio</h4>
                <p className="text-zinc-300">{userData.bio}</p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-zinc-400 mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {(userData.interests || '').split(',').filter(i => i.trim()).map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-zinc-800 rounded-full text-sm"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-lime-400">{(userData.followers || []).length}</p>
                <p className="text-xs text-zinc-500">Followers</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-lime-400">{(userData.following || []).length}</p>
                <p className="text-xs text-zinc-500">Following</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowProfile(false);
                setShowCustomization(true);
              }}
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold">Settings & Customization</h2>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Profile Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-lime-400" />
                    Profile Settings
                  </h3>
                  <div className="space-y-4 pl-7">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-300">Name</label>
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-300">Username</label>
                      <input
                        type="text"
                        value={userData.username}
                        onChange={(e) => setUserData({ ...userData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-300">Age</label>
                      <input
                        type="number"
                        value={userData.age}
                        onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-300">Interests</label>
                      <input
                        type="text"
                        value={userData.interests}
                        onChange={(e) => setUserData({ ...userData, interests: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Separate interests by comma</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-300">Bio</label>
                      <textarea
                        value={userData.bio}
                        onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition-colors resize-none"
                        placeholder="Tell us about yourself..."
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-300">Profile Color</label>
                      <div className="flex gap-2">
                        {['#84cc16', '#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'].map(color => (
                          <button
                            key={color}
                            onClick={() => setUserData({ ...userData, profileColor: color })}
                            className={`w-10 h-10 rounded-lg transition-all ${userData.profileColor === color ? 'ring-2 ring-white scale-110' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-300">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden"
                          style={{ backgroundColor: userData.profilePhoto ? 'transparent' : userData.profileColor }}
                        >
                          {userData.profilePhoto ? (
                            <img src={userData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            userData.name ? userData.name.charAt(0).toUpperCase() : 'U'
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload-custom"
                          />
                          <label
                            htmlFor="photo-upload-custom"
                            className="cursor-pointer inline-block bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            Upload Photo
                          </label>
                          {userData.profilePhoto && (
                            <button
                              onClick={() => setUserData({ ...userData, profilePhoto: '' })}
                              className="ml-2 text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appearance Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-lime-400" />
                    Appearance
                  </h3>
                  <div className="space-y-4 pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Font Size</p>
                        <p className="text-sm text-zinc-500">Adjust chat text size</p>
                      </div>
                      <select
                        value={userData.settings.fontSize}
                        onChange={(e) => setUserData({ 
                          ...userData, 
                          settings: { ...userData.settings, fontSize: e.target.value }
                        })}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Compact Mode</p>
                        <p className="text-sm text-zinc-500">Reduce spacing in chat</p>
                      </div>
                      <button
                        onClick={() => setUserData({ 
                          ...userData, 
                          settings: { ...userData.settings, compactMode: !userData.settings.compactMode }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          userData.settings.compactMode ? 'bg-lime-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          userData.settings.compactMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Timestamps</p>
                        <p className="text-sm text-zinc-500">Display message times</p>
                      </div>
                      <button
                        onClick={() => setUserData({ 
                          ...userData, 
                          settings: { ...userData.settings, showTimestamps: !userData.settings.showTimestamps }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          userData.settings.showTimestamps ? 'bg-lime-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          userData.settings.showTimestamps ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-lime-400" />
                    Privacy & Notifications
                  </h3>
                  <div className="space-y-4 pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Online Status</p>
                        <p className="text-sm text-zinc-500">Let others see when you're online</p>
                      </div>
                      <button
                        onClick={() => setUserData({ 
                          ...userData, 
                          settings: { ...userData.settings, showOnlineStatus: !userData.settings.showOnlineStatus }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          userData.settings.showOnlineStatus ? 'bg-lime-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          userData.settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Public Profile</p>
                        <p className="text-sm text-zinc-500">Make your profile visible to everyone</p>
                      </div>
                      <button
                        onClick={() => setUserData({ 
                          ...userData, 
                          settings: { ...userData.settings, publicProfile: !userData.settings.publicProfile }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          userData.settings.publicProfile ? 'bg-lime-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          userData.settings.publicProfile ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications</p>
                        <p className="text-sm text-zinc-500">Enable desktop notifications</p>
                      </div>
                      <button
                        onClick={() => setUserData({ 
                          ...userData, 
                          settings: { ...userData.settings, notifications: !userData.settings.notifications }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          userData.settings.notifications ? 'bg-lime-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          userData.settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sound Effects</p>
                        <p className="text-sm text-zinc-500">Play sounds for messages</p>
                      </div>
                      <button
                        onClick={() => setUserData({ 
                          ...userData, 
                          settings: { ...userData.settings, soundEffects: !userData.settings.soundEffects }
                        })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          userData.settings.soundEffects ? 'bg-lime-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          userData.settings.soundEffects ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 pt-4 border-t border-zinc-800 sticky bottom-0 bg-zinc-900">
                <button
                  onClick={() => {
                    saveUserData(userData);
                    setShowCustomization(false);
                  }}
                  className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-3 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'text-black' 
                  : 'bg-zinc-800 text-white'
              } ${userData.settings.compactMode ? 'py-2 px-3' : ''}`}
              style={msg.role === 'user' ? { backgroundColor: userData.profileColor } : {}}>
                <div className={`whitespace-pre-wrap break-words ${
                  userData.settings.fontSize === 'small' ? 'text-sm' :
                  userData.settings.fontSize === 'large' ? 'text-lg' : ''
                }`}>{msg.content}</div>
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-400 rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-lime-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-lime-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-lime-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-zinc-900 border-t border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500 transition-colors"
            placeholder="Ask InnovAI anything..."
            disabled={isThinking}
          />
          <button
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className="bg-lime-500 hover:bg-lime-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black p-3 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-2 flex items-center gap-3 text-xs text-zinc-500">
          <Code className="w-3 h-3" />
          <span>Powered by InnovAI • Optimized for Developers</span>
          <Search className="w-3 h-3 ml-auto" />
          <span>Web Search Enabled</span>
        </div>
      </div>
    </div>
  );
}
