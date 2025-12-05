import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateSession from './pages/CreateSession';
import SessionDetail from './pages/SessionDetail';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/sessions/create"
        element={user ? <CreateSession /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/sessions/:id"
        element={user ? <SessionDetail /> : <Navigate to="/login" replace />}
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

