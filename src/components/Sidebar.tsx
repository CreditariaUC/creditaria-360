import React, { useEffect } from 'react';
import { Users } from 'lucide-react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { setActiveMenu, closeSidebar } from '../store/slices/uiSlice';
import { Button, Link } from '@nextui-org/react';

interface ElementoMenu {
  id: string;
  etiqueta: string;
  icono: React.ReactNode;
}

interface PropsSidebar {
  elementosMenu: ElementoMenu[];
  menuActivo: string;
}

const Sidebar: React.FC<PropsSidebar> = ({ elementosMenu, menuActivo }) => {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector(state => state.ui.isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        dispatch(closeSidebar());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  const handleMenuClick = (menuId: string) => {
    dispatch(setActiveMenu(menuId));
    if (window.innerWidth < 1024) {
      dispatch(closeSidebar());
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(closeSidebar())}
        />
      )}

      <div className={`
        fixed lg:sticky top-0 inset-y-0 left-0 z-50
        w-64 h-screen bg-content1 text-foreground shadow-lg
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex-1 overflow-y-auto py-7 px-2">
          <div className="flex items-center space-x-2 px-4 mb-8">
            <Users size={24} className="text-primary" />
            <span className="text-2xl font-extrabold">Eval 360°</span>
          </div>
          <nav className="space-y-2">
            {elementosMenu.map((item) => (
              <Button
                key={item.id}
                href="#"
                as={Link}
                variant={menuActivo === item.id ? "flat" : "light"}
                className={`w-full justify-start ${
                  menuActivo === item.id ? 'bg-primary/20' : ''
                }`}
                startContent={item.icono}
                onClick={() => handleMenuClick(item.id)}
              >
                {item.etiqueta}
              </Button>
            ))}
          </nav>
        </div>
        <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-200">
          
        </div>
      </div>
    </>
  );
};

export default Sidebar;