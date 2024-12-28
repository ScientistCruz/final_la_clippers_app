import { Link, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoCalendarOutline, IoBasketballOutline } from 'react-icons/io5';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', Icon: IoHomeOutline },
    { name: 'Schedule', path: '/schedule', Icon: IoCalendarOutline },
    { name: 'Game PBP', path: '/gamePBP', Icon: IoBasketballOutline },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex flex-col items-center  bg-clippersBlack h-12">
      
      {/* Thin line above the navbar */}
      <hr className="w-10/12 border-t border-clippersGray" />

      {/* Outer border container for the segmented buttons */}
      <div className="flex w-11/12 max-w-xl border-2 border-clippersWhite rounded-md overflow-hidden bg-clippersBlack mt-2">
        {navItems.map(({ name, path, Icon }) => {
          const isActive = location.pathname === path;

          return (
            <Link key={name} to={path} className={`flex-1 flex  flex-row items-center  justify-center text-center py-2 font-semibold transition-colors hover:bg-clippersBlue hover:text-white border
                ${isActive ? 'bg-clippersBlueTransparent text-clippersWhite' : 'bg-clippersBlack text-clippersWhite'}`}>
              <Icon className='m-1' size={20} />
              {name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}