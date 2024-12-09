import React from 'react';
import { Users } from 'lucide-react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setActiveMenu } from '../store/slices/uiSlice';
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

  return (
    <div className="bg-content1 text-foreground w-64 h-screen py-7 px-2 left-0 top-0 shadow-lg">
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
            onClick={(e) => {
              e.preventDefault();
              dispatch(setActiveMenu(item.id));
            }}
          >
            {item.etiqueta}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;