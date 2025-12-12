import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Sessions from './pages/Sessions';
import Courses from './pages/Courses';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import CreateSession from './pages/CreateSession';
import SessionDetail from './pages/SessionDetail';

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* Protected Routes wrapped in Layout */}
        <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/create" element={<CreateSession />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

