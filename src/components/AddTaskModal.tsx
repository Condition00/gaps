// AddTaskModal.tsx
import React, { useState } from 'react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, slotId: string) => void;
  slots: { id: string; name: string }[]; // Assuming slots have id and name
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, slots }) => {
  const [title, setTitle] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  console.log(slots)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && selectedSlotId) {
      onAddTask(title, selectedSlotId);
      setTitle('');
      setSelectedSlotId(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Add Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Select Slot</label>
            <select
              value={selectedSlotId || ''}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="border p-2 w-full rounded"
              required
            >
              <option value="" disabled>Select a slot</option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>{slot.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-between">
            <button type="button" className="text-gray-500" onClick={onClose}>Cancel</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
