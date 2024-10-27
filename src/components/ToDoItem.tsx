import React from 'react';

const ToDoItem = ({ task, completed, onToggle }: { task: string, completed: boolean, onToggle: () => void }) => {
  return (
    <div className="flex items-center bg-stone-100 p-4 rounded-lg shadow-lg mb-5">
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggle}
        className="mr-4 h-5 w-5 accent-purple-500 cursor-pointer"
      />
      <span className={`flex-1 text-lg ${completed ? 'line-through text-gray-400' : 'text-black'}`}>
        {task}
      </span>
    </div>
  );
};

export default ToDoItem;
 