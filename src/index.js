import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const taskObj1 = [
  { title: "할일1", id: "id_1", dueDate: "2022-05-25", text: "텍스트1", isCompleted: false },
  { title: "할일2", id: "id_2", dueDate: "2022-04-25", text: "텍스트2", isCompleted: false },
  { title: "할일3", id: "id_3", text: "텍스트3", isCompleted: false },
  { title: "할일5", id: "id_5", dueDate: "2022-05-25", text: "텍스트1", isCompleted: true },
  { title: "할일6", id: "id_6", dueDate: "2022-04-25", text: "텍스트2", isCompleted: true },
  { title: "할일7", id: "id_7", text: "텍스트3", isCompleted: true },
];

root.render(
  <React.StrictMode>
    <App tasks={taskObj1} />
  </React.StrictMode>
);

