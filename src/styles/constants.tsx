import { Icon } from '@iconify/react';

import { SideNavItem } from './types';

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Home',
    path: '/',
    icon: <Icon icon="lucide:home" width="24" height="24" />,
  },
  {
    title: 'NoteTaking',
    path: '/notes',
    icon: <Icon icon="lucide:folder" width="24" height="24" />,
    submenu: true,
    subMenuItems: [
      { title: 'Class Notes', path: '/notes/' },
    ],
  },
  {
    title: 'Features',
    path: '/features',
    icon: <Icon icon="lucide:mail" width="24" height="24" />,
  },
  {
    title: 'Pomodoro',
    path: '/pomodoro',
    icon: <Icon icon="lucide:alarm-clock-check" width="24" height="24" />,
  },
  {
    title: 'Journal',
    path: '/journal',
    icon: <Icon icon="lucide:notebook" width="24" height="24" />,
  },
];