'use client';

import { useEffect, useState } from 'react';
import TaskList from '@/components/TaskList';
import PageWrapper from '@/components/page-wrapper';
import { addDoc, collection, doc, getDoc, getDocs, increment, onSnapshot, query, Timestamp, updateDoc, where } from '@firebase/firestore';
import { db } from '@/firebase';
import { UserAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
interface Todo {
  id: number; // This should be a string since Firestore document IDs are strings
  createdAt: number; // Assuming you're using a timestamp as a number
  slotId: string;
  title: string;
  completed: boolean;
  completedBy: string[];
  label?: string; // Optional, added later
}
const Home = () => {
  const { user } = UserAuth(); // Access the logged-in user
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue1, setInputValue1] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [todoItems, setTodoItems] = useState([
    // { title: 'Finish Next.js project', label: 'Urgent', completed: false },
    // { title: 'Study for exams', label: 'Important', completed: true },
    // { title: 'Grocery shopping', label: 'Low', completed: false },

    // { id: 1, title: 'Finish Project', completed: false, label: 'Important' },
    // { id: 2, title: 'Math Quiz', completed: false, label: 'Class' },
    // { id: 3, title: 'Physics Assignment', completed: false, label: 'Important' },
    // { id: 4, title: 'Chemistry Module 2', completed: false, label: 'Urgent' },
    // { id: 5, title: 'English Quiz', completed: false, label: 'Class' },
    // { id: 6, title: 'Chemistry Quiz', completed: false, label: 'Class' },
  ]);

  const openModal1 = () => setIsModalOpen1(true);
  const openModal2 = () => setIsModalOpen2(true);
  const closeModal1 = () => setIsModalOpen1(false);
  const closeModal2 = () => setIsModalOpen2(false);
  const createSlot = async (title: string) => {
    if (!user) {
      console.error("No user logged in");
      return;
    }

    const creatorId = user.uid;

    try {
      // Check if a slot with the same title already exists
      const slotsRef = collection(db, "slots");
      const q = query(slotsRef, where("title", "==", title));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Slot with this title already exists");
        return;
      }

      // Slot does not exist, so create it
      const newSlot = {
        title,
        creatorId,
        admins: [creatorId],
        createdAt: Timestamp.now(),
        membersCount: 1,
      };

      // Add the new slot to the slots collection
      const newSlotRef = await addDoc(slotsRef, newSlot);
      console.log("Slot created successfully!");

      // Now add the user to the slotMemberships collection
      const membershipRef = collection(db, "slotMemberships");
      const membershipData = {
        slotId: newSlotRef.id, // Use the ID of the newly created slot
        userId: creatorId,
        joinedAt: Timestamp.now(), // Set the joinedAt timestamp
      };

      await addDoc(membershipRef, membershipData);
      console.log("User added to slot membership successfully!");

    } catch (error) {
      console.error("Error creating slot:", error);
    } finally {
      window.location.reload()
    }
  };

  const joinSlot = async (slotName: string) => {
    if (!user) {
      console.error("No user logged in");
      return;
    }

    const userId = user.uid; // Get the user ID
    const slotsRef = collection(db, "slots"); // Reference to the slots collection

    // Query to find the slot by name
    const slotQuery = query(slotsRef, where("title", "==", slotName));
    const slotSnapshot = await getDocs(slotQuery); // Get the slot(s) with the matching name

    if (slotSnapshot.empty) {
      console.error("Slot not found");
      return;
    }

    const slotDoc = slotSnapshot.docs[0]; // Get the first document
    const slotId = slotDoc.id; // Get the ID of the slot

    // Check if the user is already a member of the slot
    const membershipsRef = collection(db, "slotMemberships");
    const existingMembershipsSnapshot = await getDocs(
      query(membershipsRef, where("slotId", "==", slotId), where("userId", "==", userId))
    );

    if (!existingMembershipsSnapshot.empty) {
      console.error("User is already a member of this slot");
      return;
    }

    // Add the user to the slotMemberships collection
    const newMembership = {
      slotId,
      userId,
      joinedAt: Timestamp.now(), // Record the join time
    };

    await addDoc(membershipsRef, newMembership);

    // Optionally, update the membersCount in the slot document
    await updateDoc(slotDoc.ref, {
      membersCount: increment(1), // Increment the member count by 1
    });

    console.log("Successfully joined the slot!");
    window.location.reload()
  };
  useEffect(() => {
    if (!user) return; // Exit if no user is logged in
    const todosRef = collection(db, 'todos');
    const unsubscribe = onSnapshot(todosRef, async (snapshot) => {
      const todosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Todo, 'id'>), // Cast data without id
      }));

      // Fetch labels from slots based on slotId
      const updatedTodos = await Promise.all(todosData.map(async (todo) => {
        const slotRef = doc(db, 'slots', todo.slotId);
        const slotSnapshot = await getDoc(slotRef)
        if (slotSnapshot.exists()) {
          const slotData = slotSnapshot.data()

          const label = slotData ? slotData.title : 'Unknown';

          return {
            id: todo.id,
            // createdAt: todo.createdAt,
            // slotId: todo.slotId,
            completedBy: todo.completedBy,
            title: todo.title,
            completed: todo.completed,
            label, // Add label here
          }; // Cast to Todo type 
        } else {
          return []
        }
      }));
      setTodoItems(updatedTodos as never[]);
      console.log("UPDATED", updatedTodos)
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);
  return (
    <>
      <PageWrapper>
        <TaskList items={todoItems} isLoading={isLoading} setLoading={setIsLoading} />
        <div className="flex space-x-4 mt-4">
          <Button variant={'outline'} onClick={openModal1} className="px-2 py-2">
            Create a Slot
          </Button>
          <Button variant={'default'} onClick={openModal2} className="px-2 py-2">
            Join a Slot
          </Button>
        </div>
      </PageWrapper>

      <Modal1
        isOpen={isModalOpen1}
        onClose={closeModal1}
        onSubmit={createSlot}
        inputValue={inputValue1}
        setInputValue={setInputValue1}
      />
      <Modal2
        isOpen={isModalOpen2}
        onClose={closeModal2}
        onSubmit={joinSlot}
        inputValue={inputValue2}
        setInputValue={setInputValue2}
      />
    </>
  );
};

export default Home;

// Modal component
const Modal2 = ({
  isOpen,
  onClose,
  onSubmit,
  inputValue,
  setInputValue
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
}) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue(''); // Reset input
    onClose(); // Close modal
  };

  return (
    <div className="z-50 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Join Slot</h2>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Join Slot"
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
        />
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="bg-gray-300 rounded-full px-4 py-2">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white rounded-full px-4 py-2">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
const Modal1 = ({
  isOpen,
  onClose,
  onSubmit,
  inputValue,
  setInputValue
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
}) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue(''); // Reset input
    onClose(); // Close modal
  };

  return (
    <div className="z-50 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Create Slot</h2>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter Slot Name"
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
        />
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="bg-gray-300 rounded-full px-4 py-2">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white rounded-full px-4 py-2">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
