// ============================================
// REACT JAVASCRIPT - src/App.jsx
// ============================================
import { useState } from 'react';
import { createFacebookLogin } from '@sndp/meta-auth-client';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginWithPopup, logout } = createFacebookLogin({
    appId: import.meta.env.VITE_META_APP_ID,
    scopes: ['email', 'public_profile']
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithPopup();
      console.log('Login result:', result);
      
      // Get user info
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${result.code}&fields=id,name,email,picture`
      );
      const userData = await response.json();
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Meta SDK Demo</h1>
        
        {!isAuthenticated ? (
          <div>
            <p>Login to get started</p>
            <button onClick={handleLogin} disabled={loading}>
              {loading ? 'Loading...' : 'Login with Facebook'}
            </button>
          </div>
        ) : (
          <div>
            <h2>Welcome, {user?.name}!</h2>
            {user?.picture && (
              <img 
                src={user.picture.data.url} 
                alt="Profile" 
                style={{ borderRadius: '50%', width: '100px' }}
              />
            )}
            <p>Email: {user?.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;