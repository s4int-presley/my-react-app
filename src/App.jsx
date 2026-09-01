import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login';
import './App.css';

// Helper: get today's date as "YYYY-MM-DD"
function getTodayString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Helper: calculate current streak from a list of completed date strings
function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;

  const dateSet = new Set(completedDates);
  let streak = 0;
  let cursor = new Date();

  // If today isn't done yet, start checking from yesterday instead
  if (!dateSet.has(getTodayString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const dateStr = cursor.toISOString().split('T')[0];
    if (dateSet.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
      completedDates: [],
      createdAt: serverTimestamp(),
    });

    setNewHabit('');
  };

  const handleToggleToday = async (habit) => {
    const today = getTodayString();
    const habitRef = doc(db, 'habits', habit.id);
    const isDoneToday = habit.completedDates?.includes(today);

    if (isDoneToday) {
      await updateDoc(habitRef, {
        completedDates: arrayRemove(today),
      });
    } else {
      await updateDoc(habitRef, {
        completedDates: arrayUnion(today),
      });
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '80px' }}>Loading...</p>;
  }

  if (!user) {
    return <Login />;
  }

  const today = getTodayString();

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
        {habits.map((habit) => {
          const isDoneToday = habit.completedDates?.includes(today);
          const streak = calculateStreak(habit.completedDates);

          return (
            <li
              key={habit.id}
              style={{
                padding: '10px 0',
                borderBottom: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <input
                type="checkbox"
                checked={isDoneToday || false}
                onChange={() => handleToggleToday(habit)}
              />
              <span style={{ flex: 1 }}>{habit.name}</span>
              <span style={{ fontSize: '14px', color: '#888' }}>
                🔥 {streak} day{streak !== 1 ? 's' : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
