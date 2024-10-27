'use client';

import React from 'react';
import { Icon } from '@iconify/react';

const AddTaskButton = () => {
  return (
    <button
      className="
        fixed 
        bottom-6 
        right-6 
        bg-pink-500 
        text-white 
        rounded-full 
        flex 
        items-center 
        p-4 
        shadow-lg 
        hover:bg-pink-600 
        focus:outline-none 
        focus:ring-2 
        focus:ring-pink-300 
        z-50
      "
      onClick={() => console.log('Add Task button clicked')}
    >
      <Icon icon="lucide:plus" width="24" height="24" />
      <span className="ml-2">Add Task</span>
    </button>
  );
};

export default AddTaskButton;
