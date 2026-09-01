import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

  // Track login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for this user's habits in real time
  useEffect(() => {
    if (!user) {
      setHabits([]);
      return;
    }

    const q = query(collection(db, 'habits'), where('uid', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(habitList);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    await addDoc(collection(db, 'habits'), {
      uid: user.uid,
      name: newHabit.trim(),
      createdAt: serverTimestamp(),
    });

    setNewHabit('');
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '80px' }}>Loading...</p>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', textAlign: 'center' }}>
      <h1>DailyWin</h1>
      <p>Logged in as: {user.email}</p>
      <button onClick={() => signOut(auth)}>Log Out</button>

      <form onSubmit={handleAddHabit} style={{ marginTop: '30px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="New habit (e.g. Drink water)"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0, textAlign: 'left' }}>
        {habits.map((habit) => (
          <li key={habit.id} style={{ padding: '8px 0', borderBottom: '1px solid #333' }}>
            {habit.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
