import { useEffect, useState } from 'react';
import './App.css';

type Task = {
  Id: number;
  Title: string;
  Completed: number;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Unable to load tasks');
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error('Unable to create task');
      }

      const created = await response.json();
      setTasks((current) => [...current, created]);
      setNewTitle('');
    } catch (err) {
      setError('Unable to create task');
    }
  };

  return (
    <div className="app-container">
      <h1>Study Fullstack App</h1>
      <form onSubmit={handleSubmit} className="task-form">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task title"
        />
        <button type="submit">Add task</button>
      </form>
      {error && <div className="error">{error}</div>}
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.Id}>
            <span>{task.Title}</span>
            <span>{task.Completed ? '✅' : '⬜'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
