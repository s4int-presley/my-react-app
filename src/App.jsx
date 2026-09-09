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
import Silk from './Silk';
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
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
          <Silk speed={5} scale={1} color="#22D3EE" noiseIntensity={1.5} rotation={0} />
        </div>
        <p style={{ textAlign: 'center', marginTop: '80px', color: 'white' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
          <Silk speed={5} scale={1} color="#22D3EE" noiseIntensity={1.5} rotation={0} />
        </div>
        <Login />
      </div>
    );
  }

  const today = getTodayString();

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <Silk speed={5} scale={1} color="#22D3EE" noiseIntensity={1.5} rotation={0} />
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: 'white',
              textShadow: '0 0 24px rgba(168, 85, 247, 0.7)',
              marginBottom: '8px',
            }}
          >
            DailyWin
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '12px' }}>
            {user.email}
          </p>
          <button
            onClick={() => signOut(auth)}
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        </div>

        <form
          onSubmit={handleAddHabit}
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '28px',
            background: 'rgba(20, 20, 25, 0.5)',
            backdropFilter: 'blur(10px)',
            padding: '10px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <input
            type="text"
            placeholder="New habit (e.g. Drink water)"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '999px',
              border: 'none',
              background: 'transparent',
              color: 'white',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {habits.map((habit) => {
            const isDoneToday = habit.completedDates?.includes(today);
            const streak = calculateStreak(habit.completedDates);

            return (
              <div
                key={habit.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  background: isDoneToday
                    ? 'rgba(168, 85, 247, 0.15)'
                    : 'rgba(20, 20, 25, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: isDoneToday
                    ? '1px solid rgba(168, 85, 247, 0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="checkbox"
                  checked={isDoneToday || false}
                  onChange={() => handleToggleToday(habit)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#a855f7' }}
                />
                <span style={{ flex: 1, color: 'white', fontWeight: 500 }}>{habit.name}</span>
                <span
                  style={{
                    fontSize: '13px',
                    color: streak > 0 ? '#c084fc' : 'rgba(255,255,255,0.4)',
                    fontWeight: 600,
                  }}
                >
                  🔥 {streak} day{streak !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
