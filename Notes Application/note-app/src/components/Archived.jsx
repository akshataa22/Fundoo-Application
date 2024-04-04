import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AddAlertOutlinedIcon from '@mui/icons-material/AddAlertOutlined';
import noteService from './../services/notesService';
import Tooltip from '@mui/material/Tooltip';
import './../styles/note.css';
import './../styles/Trash.css';
import Header from './Header';
import Sidebar from './Sidebar';

const Archived = (props) => {
  const [notes, setNotes] = useState([]);
  const [archivedNotes, setArchivedNotes] = useState([]);
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

  const handleDelete = (id) => {
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

  const handleColorIconClick = (noteId) => {
    setSelectedNoteId(noteId === selectedNoteId ? null : noteId);
  };

  useEffect(() => {
    fetchArchivedNotes();
  }, []);

  const fetchArchivedNotes = async () => {
    try {
      const data = await noteService.fetchArchivedNotes(token);
      setArchivedNotes(data);
    } catch (error) {
      console.error('Error fetching archived notes:', error);
    }
  };

  const updateNote = async (id, updatedNote) => {
    try {
      await noteService.updateNote(id, updatedNote, token);
      setArchivedNotes(notes.map(note => (note.id === id ? updatedNote : note)));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await noteService.setNoteToUnArchive(id, token);
      setArchivedNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error unarchiving note:', error);
    }
  };

  const handleTrash = async (id) => {
    try {
      await noteService.setNoteToTrash(id, token);
      setArchivedNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error trashing note:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query); // Update search query state
    try {
      if (query.trim() === '') {
        fetchArchivedNotes();// Fetch all notes again when search query is empty
      } else {
        const searchResults = await noteService.searchNotes(query, token); // Call searchNotes function
        setArchivedNotes(searchResults); // Update notes state with search results
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
          {archivedNotes.map((note) => (
            <div key={note.id} className="note-card" style={{  marginLeft: layoutMode === 'vertical' ? '0' : '272px', width: layoutMode === 'vertical' ? '260px' : '51.4%', marginRight: layoutMode === 'horizontal' ? '20px' : '20px'}} >
              <div style={{ position: 'relative' }}>
  {noteImages[note.id] && (
    <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden' }}>
      <img src={noteImages[note.id]} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <Button
        className="delete-button"
        style={{ border:'none', position: 'absolute', bottom: '5px', right: '5px' }}
        outline
        size="sm"
        onClick={() => handleDelete(note.id)}
        title="Permanently Delete"
      >
        <DeleteOutlinedIcon fontSize="small" />
      </Button>
    </div>
  )}
</div>
 <Card className="card" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
 <CardBody className="trash-card-body" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
  <CardTitle contentEditable className="card-title" onBlur={(e) => updateNote(note.id, { ...note, title: e.target.innerText })}>{note.title}</CardTitle>
    <CardText contentEditable className="trash-card-text" onBlur={(e) => updateNote(note.id, { ...note, description: e.target.innerText })}>{note.description}</CardText>
    <div className="trashed-button">
    <Button style={{padding:5}} onClick={() => handleTrash(note.id)} >
    <Tooltip title="Trash"> <DeleteOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}} onClick={() => handleUnarchive(note.id)}>
    <Tooltip title="Unarchive">  <UnarchiveOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}}>
    <Tooltip title="Remind me"> <AddAlertOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}}><label htmlFor={`image-upload-${note.id}`}>
    <Tooltip title="Add Image"> <ImageOutlinedIcon fontSize="small" style={{cursor:'pointer'}} /></Tooltip> 
      <input id={`image-upload-${note.id}`} type="file" onChange={(e) => handleImageUpload(e, note.id)} style={{ display: 'none' }} /></label>
    </Button>
    <Button style={{padding:5}} onClick={() => handleColorIconClick(note.id)}>
    <Tooltip title="Background Options"> <PaletteOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}}>
    <Tooltip title="Add Label"><LocalOfferOutlinedIcon fontSize="small"/> </Tooltip>
    </Button>
   </div>
 </CardBody>
 </Card>
 <div className="color-options" style={{ display: selectedNoteId === note.id ? 'block' : 'none' }}>
  <Card className="ColorCard">
    <CardBody className="ColorCardContainer">
      <div className="color-option" style={{ backgroundColor: 'white' }} onClick={() => handleColorChange(note.id, 'white')}></div>
      <div className="color-option" style={{ backgroundColor: '#EFB495' }} onClick={() => handleColorChange(note.id, '#EFB495')}></div>
      <div className="color-option" style={{ backgroundColor: '#E2BEBE' }} onClick={() => handleColorChange(note.id, '#E2BEBE')}></div>
      <div className="color-option" style={{ backgroundColor: '#B5C0D0' }} onClick={() => handleColorChange(note.id, '#B5C0D0')}></div>
      <div className="color-option" style={{ backgroundColor: '#EADFB4' }} onClick={() => handleColorChange(note.id, '#EADFB4')}></div>
      <div className="color-option" style={{ backgroundColor: '#92C7CF' }} onClick={() => handleColorChange(note.id, '#92C7CF')}></div>
      <div className="color-option" style={{ backgroundColor: '#EC7700' }} onClick={() => handleColorChange(note.id, '#EC7700')}></div>
      <div className="color-option" style={{ backgroundColor: '#9CAFAA' }} onClick={() => handleColorChange(note.id, '#9CAFAA')}></div>
      <div className="color-option" style={{ backgroundColor: '#D37676' }} onClick={() => handleColorChange(note.id, '#D37676')}></div>
      <div className="color-option" style={{ backgroundColor: '#A5DD9B' }} onClick={() => handleColorChange(note.id, '#A5DD9B')}></div>
      <div className="color-option" style={{ backgroundColor: '#F5DD61' }} onClick={() => handleColorChange(note.id, '#F5DD61')}></div>
      <div className="color-option" style={{ backgroundColor: '#FC819E' }} onClick={() => handleColorChange(note.id, '#FC819E')}></div>
      <div className="color-option" style={{ backgroundColor: '#7469B6' }} onClick={() => handleColorChange(note.id, '#7469B6')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFE6E6' }} onClick={() => handleColorChange(note.id, '#FFE6E6')}></div> 
    </CardBody>
  </Card>
</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Archived;
