import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SwitchGrid from './components/SwitchGrid';
import NotificationPanel from './components/NotificationPanel';

function Window() {
  return (
    <div className="main-window">
      <SwitchGrid />
      <NotificationPanel />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Window />} />
      </Routes>
    </Router>
  );
}
