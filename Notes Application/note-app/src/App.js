import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'reactstrap';
import Login from './pages/Login';
import Register from './pages/Register';
import Trashed from './components/Trashed';
import Note from './components/Note';
import Archived from './components/Archived';
import Label from './components/Label';
import Reminder from './components/Reminder';
import Header from './components/Header'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
  <div>  
    <Router>
      <Container>
       <AppRouter />
       <ToastContainer />
      </Container>
    </Router>
  </div>
  );
}

const AppRouter = () => {
  
  return (
    <>
      <Routes>
        <Route path="/header" element={<Header />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element ={<Register />} />
        <Route path="/note" element={<Note />} />
        <Route path="/Archive" element={<Archived />} />
        <Route path="/Trash" element={<Trashed />} />
        <Route path="/label" element={<Label />} />
        <Route path="/Reminder" element={<Reminder />} />
      </Routes>
    </>
  );
};

export default App;