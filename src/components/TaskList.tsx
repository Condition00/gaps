'use client';

import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Tag } from 'lucide-react';
import { BellRing } from 'lucide-react';
import { ClockArrowUp } from 'lucide-react';
import AddTaskModal from './AddTaskModal';
import { db } from '@/firebase';
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from '@firebase/firestore';
import { UserAuth } from '@/context/AuthContext';

// Define the Task type
type Task = {
  id: number;
  title: string;
  label: string;
  completed: boolean;
  completedBy: string[]
};

// Define TaskList's props to accept items of type Task[]
interface TaskListProps {
  items: Task[];
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

// Update TaskList to accept items as a prop with TaskListProps
const TaskList: React.FC<TaskListProps> = ({ items, isLoading, setLoading }) => {
  const [tasks, setTasks] = useState(items)
  const [slots, setSlots] = useState<{ id: string; name: string }[]>([]);
  const [slotCounts, setSlotCounts] = useState<{ [key: string]: number }>({});
  const [slotNameToIdMap, setSlotNameToIdMap] = useState<{ [key: string]: string }>({});
  const [isModalOpen, setModalOpen] = useState(false);

  const [selectedLabel, setSelectedLabel] = useState<string>('');
  // const [tasks, setTasks] = useState([
  //   { id: 1, task: 'Finish Project', completed: false, category: 'Important' },
  //   { id: 2, task: 'Math Quiz', completed: false, category: 'Class' },
  //   { id: 3, task: 'Physics Assignment', completed: false, category: 'Important' },
  //   { id: 4, task: 'Chemistry Module 2', completed: false, category: 'Urgent' },
  //   { id: 5, task: 'English Quiz', completed: false, category: 'Class' },
  //   { id: 6, task: 'Chemistry Quiz', completed: false, category: 'Class' },
  // ]);
  const { user } = UserAuth(); // Access the logged-in user

  const userId = user?.uid
  useEffect(() => {
    if (!userId) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const membershipsQuery = query(
          collection(db, 'slotMemberships'),
          where('userId', '==', userId)
        );
        const membershipsSnapshot = await getDocs(membershipsQuery);
        const slotIds = membershipsSnapshot.docs.map(doc => doc.data().slotId);

        const slotsPromises = slotIds.map(slotId =>
          getDoc(doc(db, 'slots', slotId))
        );

        const slotsSnapshot = await Promise.all(slotsPromises);
        const fetchedSlots = slotsSnapshot.map(slotDoc => ({
          id: slotDoc.id,
          name: slotDoc.data()?.title || "Loading...",
        }));

        // Map slot names to their IDs
        const nameToIdMap: { [key: string]: string } = {};
        fetchedSlots.forEach(slot => {
          nameToIdMap[slot.name] = slot.id;
        });
        setSlotNameToIdMap(nameToIdMap);
        setSlots(fetchedSlots);

        // Get counts of users in each slot by ID
        const counts: { [key: string]: number } = {};
        for (const slot of fetchedSlots) {
          counts[slot.id] = await countUsersInSlotById(slot.id);
        }
        setSlotCounts(counts);

        const slotNames = fetchedSlots.map(slot => slot.name);
        setTasks(items.filter(task => slotNames.includes(task.label)));

      } catch (error) {
        console.error("Error fetching slots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [userId, items, setLoading]);
  const countUsersInSlotById = async (slotId: string) => {
    try {
      const membershipsQuery = query(
        collection(db, 'slotMemberships'),
        where('slotId', '==', slotId)
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);
      return membershipsSnapshot.size;
    } catch (error) {
      console.error("Error counting users in slot:", error);
      return 0;
    }
  };
  // useEffect(() => {
  //   if (!userId) return

  //   const fetchSlots = async () => {
  //     setLoading(true)
  //     try {
  //       // Query to fetch slot memberships for the user
  //       const membershipsQuery = query(
  //         collection(db, 'slotMemberships'),
  //         where('userId', '==', userId)
  //       );
  //       const membershipsSnapshot = await getDocs(membershipsQuery);

  //       // Extract slot IDs from the memberships
  //       const slotIds = membershipsSnapshot.docs.map(doc => doc.data().slotId);

  //       // Fetching slots details based on the fetched slot IDs
  //       const slotsPromises = slotIds.map(slotId =>
  //         getDoc(doc(db, 'slots', slotId))
  //       );

  //       // Wait for all slot details to be fetched
  //       const slotsSnapshot = await Promise.all(slotsPromises);

  //       // Constructing the slots array with id and name
  //       const fetchedSlots = slotsSnapshot.map(slotDoc => ({
  //         id: slotDoc.id,
  //         name: slotDoc.data()?.title || "Loading...", // Fallback if name is undefined
  //       }));
  //       const slotNames = fetchedSlots.map(slot => slot.name)
  //       setTasks(items.filter(task => slotNames.includes(task.label)))
  //       // Update the state with fetched slots
  //       setSlots(fetchedSlots);
  //     } catch (error) {
  //       console.error("Error fetching slots:", error);
  //     } finally {
  //       setLoading(false)
  //     }
  //   };

  //   fetchSlots();
  // }, [userId, items]);
  const countUsersInSlotByName = async (slotName: string) => {
    try {
      const slotsQuery = query(
        collection(db, 'slots'),
        where('title', '==', slotName)
      );
      const slotsSnapshot = await getDocs(slotsQuery);

      if (slotsSnapshot.empty) return 0;

      const slotId = slotsSnapshot.docs[0].id; // Get the first matching slot ID
      const membershipsQuery = query(
        collection(db, 'slotMemberships'),
        where('slotId', '==', slotId)
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);
      return membershipsSnapshot.size;
    } catch (error) {
      console.error("Error counting users in slot:", error);
      return 0;
    }
  };
  const toggleComplete = async (id: number) => {


    if (!userId) return

    const taskToUpdate = tasks.find(task => task.id === id);
    if (!taskToUpdate) return;
    console.log("YES", taskToUpdate)
    // Check if the user ID is already in the completedBy list
    const isUserCompleted = taskToUpdate.completedBy?.includes(userId);

    // Create the updated task
    const updatedTask = {
      ...taskToUpdate,
      completed: isUserCompleted ? true : false, // Toggle completion based on presence in completedBy
    };

    // Update the local state
    // setTasks(
    //   tasks.map((task) =>
    //     task.id === id ? updatedTask : task
    //   )
    // );

    try {
      // Reference to the Firestore document
      const taskDocRef = doc(db, 'todos', taskToUpdate.id.toString());

      // Prepare updates
      const updates = {
        completedBy: arrayUnion(userId), // Add the userId to the updatedBy list
      };

      // If the user is marking the task as complete
      if (isUserCompleted) {
        updates.completedBy = arrayRemove(userId); // Remove userId from completedBy list
      } else {
        updates.completedBy = arrayUnion(userId); // Add userId to completedBy list
      }

      // Perform the Firestore update
      await updateDoc(taskDocRef, updates);

    } catch (error) {
      console.error("Error updating task:", error);
      // const rerollUpdatedTask = { ...taskToUpdate, completed: taskToUpdate.completed };
      // setTasks(
      //   tasks.map((task) =>
      //     task.id === id ? rerollUpdatedTask : task
      //   )
      // );
    }

  };

  const addTask = () => {
    setModalOpen(true);
  };
  const colorClasses = [
    'bg-purple-100 text-purple-500',
    'bg-blue-100 text-blue-500',
    'bg-red-100 text-red-500',
  ];

  const handleAddTask = async (title: string, slotId: string) => {
    const newTask = {
      slotId: slotId,
      title: title,
      createdAt: new Date().getTime(), // Use current timestamp
      completed: false,
      completedBy: []
    };

    try {
      const todosCollectionRef = collection(db, 'todos');
      await addDoc(todosCollectionRef, newTask);
      // setTasks([...tasks, newTask]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };


  // Handle dropdown change

  const handleLabelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

    setSelectedLabel(event.target.value);

  };



  const filteredTasks = selectedLabel

    ? tasks.filter(task => task.label === selectedLabel)

    : tasks;



  // Get unique labels from tasks

  const uniqueLabels = Array.from(new Set(tasks.map(task => task.label)));



  // Separate tasks into completed and active

  const activeTasks = filteredTasks.filter(task => !task.completedBy?.includes(userId || ""));

  const completedTasks = filteredTasks.filter(task => task.completedBy?.includes(userId || ""))


  return (
    <div className="max-w-7xl ml-1 mx-full mt-3 h-full">
      {/* List Container with Header and Completed count inside */}
      <div className="bg-white flex-grow p-6 rounded-lg shadow-md pb-8 h-full"> {/* Stretching background with `pb-8` */}

        {/* Todo List Header and Completed Count */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Tasks:</h1>
          {/* <div className="flex items-center">
            <span className="mr-2">{`${tasks.filter(task => task.completed).length}/${tasks.length}`}</span>
            <span>Completed</span>
          </div> */}
        </div>
        {isLoading && <div role="status" className='mx-auto w-fit m-2'>
          <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>}
        {/* Dropdown for filtering by label */}

        <div className="mb-4 flex items-center">

          <select

            value={selectedLabel}

            onChange={handleLabelChange}

            className="border p-1 text-sm rounded-lg shadow-sm w-40"

          >

            <option value="">All</option>

            {uniqueLabels.map((label, index) => (

              <option key={index} value={label}>

                {label}

              </option>

            ))}

          </select>

        </div>
        {/* Task List */}
        {activeTasks.map(({ id, title, completed, completedBy, label }) => {
          const slotId = slotNameToIdMap[label]; // Get slot ID from the mapping
          const totalCount = slotCounts[slotId] || 0;
          const finalCompleted = completedBy?.includes(userId || "")
          const getRandomColorClass = () => {
            const randomIndex = Math.floor(Math.random() * colorClasses.length);
            return colorClasses[randomIndex];
          };
          const randomColorClass = getRandomColorClass();
          return (
            <div
              key={id}
              className={`cursor-pointer flex items-center justify-between p-3 mb-2 bg-gray-100 rounded-lg shadow-sm ${finalCompleted ? 'opacity-50' : ''
                }`}
              onClick={() => toggleComplete(id)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-4"
                  checked={finalCompleted}
                  onChange={() => toggleComplete(id)}
                />
                <span>{title}</span>
              </div>
              <div className='flex items-center justify-center ml-auto'>
                <div className="flex items-center">
                  <span className="mr-2">{`${tasks.find(task => task.id === id)?.completedBy?.length}/${totalCount}`}</span>
                </div>
                <span
                  className={`ml-auto mx-3 px-2 py-1 rounded-full text-xs font-bold ${randomColorClass}`}
                >
                  {label}
                </span>
              </div>
              <Trash2 size={16} />
            </div>
          )
        })}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Completed Tasks</h2>
            {completedTasks.map(({ id, title, label }) => (
              <div
                key={id}
                className={`flex items-center justify-between p-3 mb-2 bg-gray-100 rounded-lg shadow-sm opacity-50 cursor-pointer`}
                onClick={() => toggleComplete(id)} // Toggle on click anywhere in the section
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-4"
                    checked={true} // Marked as completed
                    readOnly // Make checkbox read-only to prevent direct interaction
                  />
                  <span>{title}</span>
                </div>
                <span className={`ml-auto mx-3 px-2 py-1 rounded-full text-xs font-bold`}>
                  {label}
                </span>
                <Trash2 size={16} />
              </div>
            ))}
          </div>
        )}



        <div className="flex justify-between items-center space-x-4 mt-6">
          {/* Left-aligned icons */}
          <div className="px-1 flex space-x-4">
            <ClockArrowUp className="w-5 h-5" />
            <Tag className="w-5 h-5" />
            <BellRing className="w-5 h-5" />
          </div>

          {/* Right-aligned button */}
          <button
            className=" text-black px-4 py-3 "
            onClick={addTask}
          >
            + Add a Task
          </button>
          <AddTaskModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onAddTask={handleAddTask}
            slots={slots}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskList;
