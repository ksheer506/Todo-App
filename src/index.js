import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

function rootRender(tasks) {
  const root = ReactDOM.createRoot(document.getElementById('root'));

  root.render(
    <React.StrictMode>
      <App tasks={tasks} />
    </React.StrictMode>
  );
};

export default rootRender;


