import React, { useEffect, useState } from 'react';
import { Bell, Settings, LogOut, User, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Session } from '@supabase/supabase-js';
import AccountSettings from './Account/AccountSettings';
import { useAuth } from '../contexts/AuthContext';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { setNotifications, markAsRead, markAllAsRead, removeNotification } from '../store/slices/notificationSlice';
import { notificationService } from '../services/notification.service';
import NotificationList from './Notifications/NotificationList';
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@nextui-org/react';

interface HeaderProps {
  session: Session;
}

const Header: React.FC<HeaderProps> = ({ session }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { profile } = useAuth();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.notification.notifications);
  const unreadCount = useAppSelector(state => state.notification.unreadCount);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifications = await notificationService.getNotifications();
        dispatch(setNotifications(notifications));
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast.error('Error al cargar las notificaciones');
      }
    };

    loadNotifications();
  }, [dispatch]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      dispatch(markAsRead(id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Error al marcar la notificación como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch(markAllAsRead());
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Error al marcar todas las notificaciones como leídas');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      dispatch(removeNotification(id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar la notificación');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const menuItems = [
    { 
      key: 'settings', 
      label: 'Configuración de Cuenta',
      icon: <Settings size={16} />,
      onClick: onOpen
    },
    { 
      key: 'logout', 
      label: 'Cerrar Sesión',
      icon: <LogOut size={16} />,
      onClick: handleLogout,
      color: 'danger' as const
    }
  ];

  return (
    <>
      <Navbar 
        isBordered 
        className="bg-content1"
        classNames={{
          wrapper: "max-w-full px-4 justify-end"
        }}
      >
        <NavbarContent className="gap-4" justify="end">
          <NavbarItem>
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button isIconOnly variant="light" aria-label="Notificaciones">
                  <Badge 
                    content={unreadCount} 
                    color="danger"
                    isInvisible={unreadCount === 0}
                  >
                    <Bell size={20} className="text-gray-600" />
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <NotificationList
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDeleteNotification}
                />
              </PopoverContent>
            </Popover>
          </NavbarItem>
          
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button 
                  variant="light" 
                  className="flex items-center gap-2"
                >
                  <span className="hidden sm:block">{session.user.email}</span>
                  <Avatar
                    icon={<User size={20} />}
                    classNames={{
                      base: "bg-primary/20",
                      icon: "text-primary"
                    }}
                    size="sm"
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Acciones de perfil">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">{session.user.email}</p>
                  <p className="text-sm text-default-500">
                    {profile?.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </p>
                </DropdownItem>
                {menuItems.map((item) => (
                  <DropdownItem
                    key={item.key}
                    color={item.color}
                    startContent={item.icon}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Configuración de Cuenta
          </ModalHeader>
          <ModalBody>
            <AccountSettings />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Header;