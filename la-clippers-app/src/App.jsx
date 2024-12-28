import { Routes, Route } from 'react-router-dom';
import BottomNav from './pages/BottomNav';
import TitleBar from './pages/TitleBar';
import Schedule from './pages/Schedule';
import GamePBP from './pages/GamePBP';
import { SelectedProvider } from './pages/SelectedContext';
import Home from './pages/Home';


function App() {
  return (
    
    <div className="relative w-full h-screen bg-clippersBlack">
      <SelectedProvider>

      <TitleBar />
      <BottomNav />

      <div className="absolute top-14 bottom-12 left-0 right-0 overflow-y-hidden bg-clippersBlack mt-6">

        <Routes>

         <Route path="/" element={<Home />} />
         <Route path="/schedule" element={<Schedule />} />
         <Route path="/GamePBP" element={<GamePBP />} />

        </Routes>
    </div>
    </SelectedProvider>
  </div>
  );
}


export default App;