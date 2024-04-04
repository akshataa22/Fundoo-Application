import React, { useState, useEffect } from "react";
import { Card, CardBody, CardTitle, CardText, Button } from "reactstrap";
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Tooltip from '@mui/material/Tooltip';
import noteService from "../services/notesService";
import './../styles/note.css';
import './../styles/Trash.css'
import Header from "./Header";
import Sidebar from "./Sidebar";

const Trashed = (props) => {
  const [notes, setNotes] = useState([]);
  const [trashedNotes, setTrashedNotes] = useState([]);
  const token = localStorage.getItem('token');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState({});
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteImages, setNoteImages] = useState({}); 
  const [layoutMode, setLayoutMode] = useState('vertical'); // Default layout mode is vertical
    
  const toggleLayoutMode = () => {
   setLayoutMode(prevMode => (prevMode === 'vertical' ? 'horizontal' : 'vertical'));
  };

    useEffect(() => {
      // Load selectedColor from local storage
      const storedColors = localStorage.getItem('noteColors');
      if (storedColors) {
        setSelectedColor(JSON.parse(storedColors));
      }
    }, []);
    
  useEffect(() => {
    // Retrieve image URLs from local storage
    const localStorageImages = JSON.parse(localStorage.getItem('noteImages')) || {};
    setNoteImages(localStorageImages);
  }, []);

  const handleImageUpload = (event, id) => {
    try {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = () => {
        const imageUrl = reader.result;
        setNoteImages(prevImages => ({
          ...prevImages,
          [id]: imageUrl
        }));
        const localStorageImages = JSON.parse(localStorage.getItem('noteImages')) || {};
        localStorageImages[id] = imageUrl;
        localStorage.setItem('noteImages', JSON.stringify(localStorageImages));
      };
  
      if (file) {
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling image upload:', error);
    }
  };

  const handleDeleteImage = (id) => {
    const updatedNoteImages = { ...noteImages };
    delete updatedNoteImages[id];
    setNoteImages(updatedNoteImages); // Update component state
    localStorage.setItem('noteImages', JSON.stringify(updatedNoteImages)); // Update local storage
  };

    const handleColorChange = (id, color) => {
      setSelectedColor(prevSelectedColor => ({
        ...prevSelectedColor,
        [id]: color
      }));
      localStorage.setItem('noteColors', JSON.stringify({
        ...selectedColor,
        [id]: color
      }));
      if (props.note) {
        props.updateColor(color, id);
      }
    };
  
    useEffect(() => {
        fetchTrashedNotes();
    }, []);

    const fetchTrashedNotes = async () => {
        try {
            const data = await noteService.fetchTrashedNotes(token);
            setTrashedNotes(data);
        } catch (error) {
            console.error('Error fetching trashed notes:', error);
        }
    };

    const handleUntrash = async (id) => {
        try {
            await noteService.setNoteToUnTrash(id, token);
            setTrashedNotes(prevNotes => prevNotes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error untrashing note:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await noteService.deleteNote(id, token);
            setTrashedNotes(prevNotes => prevNotes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleSearch = async (query) => {
      setSearchQuery(query); // Update search query state
      try {
        if (query.trim() === '') {
          fetchTrashedNotes();// Fetch all notes again when search query is empty
        } else {
          const searchResults = await noteService.searchNotes(query, token); // Call searchNotes function
          setTrashedNotes(searchResults); // Update notes state with search results
        }
      } catch (error) {
        console.error('Error searching notes:', error);
      }
    };
  
    return (
      <div className="App">
        <Header handleSearch={handleSearch}  layoutMode={layoutMode} toggleLayoutMode={toggleLayoutMode} />
      <div className="main">
        <Sidebar />
          <div className="trashed-notes">
            {trashedNotes.map((note) => (
              <div key={note.id} className="note-card" style={{ marginLeft: layoutMode === 'vertical' ? '0' : '303px', width: layoutMode === 'vertical' ? '260px' : '49%', marginRight: layoutMode === 'horizontal' ? '20px' : '15px' }}>
                 <div style={{ position: 'relative' }}>
  {noteImages[note.id] && (
    <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden' }}>
      <img src={noteImages[note.id]} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <Button
        className="delete-button"
        style={{ border:'none', position: 'absolute', bottom: '5px', right: '5px' }}
        outline
        size="sm"
        onClick={() => handleDeleteImage(note.id)}
        title="Permanently Delete"
      >
        <DeleteOutlinedIcon fontSize="small" />
      </Button>
    </div>
  )}
</div>
  <Card className="card"  style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
   <CardBody className="trash-card-body"  style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
    <CardTitle className="card-title">{note.title}</CardTitle>
    <CardText className="trash-card-text">{note.description}</CardText>
  <div className="trashed-button" style={{marginLeft:5}}>
  <Button className="delete-button" outline size="sm" onClick={() => handleDelete(note.id)}>
    <Tooltip title="Delete Forever"><DeleteForeverOutlinedIcon fontSize="small" /> </Tooltip> 
  </Button>
  <Button className="untrash-button" onClick={() => handleUntrash(note.id)}>
    <Tooltip title="Restore"><RestoreFromTrashOutlinedIcon fontSize="small" /> </Tooltip>
  </Button>
  </div>
  </CardBody>
  </Card>
  </div>
  ))}
  </div>
  </div>
  </div>
  )};
  
export default Trashed;