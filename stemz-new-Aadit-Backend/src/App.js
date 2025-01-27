// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Contact from './routes/Contact';
import Home from './routes/Home';
import About from './routes/About';
import GetInvolved from './routes/GetInvolved';
import OnlineClasses from './routes/OnlineClasses';
import SelfPacedClasses from './routes/SelfPacedClasses';
import News from './routes/News';
import LoginForm from './routes/LoginForm';
import SignUpForm from './routes/SignUpForm';
import Dashboard from './routes/dashboard';
import Leaderboard from './components/Leaderboard';
import Heatmap from './components/Heatmap';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about-us' element={<About />} />
        <Route path='/get-involved' element={<GetInvolved />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/online-classes' element={<OnlineClasses />} />
        <Route path='/self-paced-classes' element={<SelfPacedClasses />} />
        <Route path='/news' element={<News />} />
        <Route path='/login' element={<LoginForm />} />
        <Route path='/sign-up' element={<SignUpForm />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/leaderboard' element={<Leaderboard />} />
        <Route path='/heatmap' element={<Heatmap />} />
      </Routes>
    </Router>
  );
}

export default App;
