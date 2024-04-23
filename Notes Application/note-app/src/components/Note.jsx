import React, { useState, useEffect } from 'react';
import noteService from './../services/notesService';
import ReminderService from './../services/ReminderService';
import './../styles/note.css';
import './../styles/ResponsiveNote.css'
import { Input, Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import AddAlertOutlinedIcon from '@mui/icons-material/AddAlertOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import Tooltip from '@mui/material/Tooltip';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from './Header';
import Sidebar from './Sidebar';
import LabelCard from './LabelCard';
import Reminder from './Reminder';

const ReminderTab = ({ reminder, onDelete }) => {
  return (
    <div className="reminder-tab">
      <span>{reminder}</span>
      <button onClick={onDelete}><CloseOutlinedIcon fontSize="small" /></button>
    </div>
  );
};

const Note = (props) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', description: '',color: 'white' });
  const [reminderDates, setReminderDates] = useState({}); // State to store reminder dates for each note
  const token = localStorage.getItem('token');
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [hasPinnedNotes, setHasPinnedNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState('vertical'); // Default layout mode is vertical
  const [selectedColor, setSelectedColor] = useState({});   // State to store colors for individual notes
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteImages, setNoteImages] = useState({}); 
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState({});
  const [showReminder, setShowReminder] = useState({});  
  const [showLabel, setShowLabel] = useState({});  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);
  const pinnedNotes = notes.filter(note => note.pinned);
  const unpinnedNotes = notes.filter(note => !note.pinned);

  const checkReminder = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert current time to minutes
    Object.entries(reminderDates).forEach(([id, reminderDate]) => {
      const parsedReminderDate = new Date(reminderDate);
      const reminderTime = parsedReminderDate.getHours() * 60 + parsedReminderDate.getMinutes(); // Convert reminder time to minutes
      if (currentTime >= reminderTime) {
        const reminderKey = `reminderTriggered-${id}`;
        if (!localStorage.getItem(reminderKey)) {
          const updatedReminderDates = { ...reminderDates };
          delete updatedReminderDates[id];
          setReminderDates(updatedReminderDates);
          localStorage.setItem(reminderKey, 'true');
          console.log("try to toast");
          toast.info(`Reminder for note with ID ${id} has been triggered!`, {
            position: 'top-center',
            autoClose: 5000 
          });
          handleDeleteReminder(id);
        }
      } else {
        localStorage.removeItem(`reminderTriggered-${id}`);
      }
    });
  };
  
    useEffect(() => {
      checkReminder();
      const interval = setInterval(() => {
        console.log("checking reminder");
        checkReminder();
      }, 60000); 
      return () => clearInterval(interval);
    }, [reminderDates]);
  
    const handleToggleCalendar = (noteId) => {
      setShowCalendar({ ...showCalendar, [noteId]: !showCalendar[noteId] });
    };
    useEffect(() => {
      const storedReminderDates = JSON.parse(localStorage.getItem('reminderDates')) || {};
      const parsedReminderDates = Object.fromEntries(
        Object.entries(storedReminderDates).map(([id, date]) => [id, new Date(date).toLocaleString()])
      );
      setReminderDates(parsedReminderDates);
    }, []);
  
      const handleSetReminder = async (id) => {
    try {
      const selectedDate = document.getElementById(`dateOfReminder-${id}`).value;
      const selectedTime = document.getElementById(`remindertime-${id}`).value;
      if (selectedDate && selectedTime) {
        const selectedDateTime = `${selectedDate}T${selectedTime}`;
        await ReminderService.setReminder(id, { reminder: selectedDateTime }, token);
        const newReminderDates = { ...reminderDates, [id]: new Date(selectedDateTime) };
            setReminderDates(newReminderDates);
            localStorage.setItem('reminderDates',JSON.stringify(newReminderDates));
        console.log('Reminder set successfully for note with ID:', id);
        handleToggleCalendar(id);
      }
    } catch (error) { 
      console.error('Error setting reminder:', error);
    }
  };
    
  
    const handleDeleteReminder = async (id) => {
    try {
      await ReminderService.deleteReminder(id, token);
      // Remove the reminder date for the specified note ID
      const updatedReminderDates = { ...reminderDates };
      delete updatedReminderDates[id];
      setReminderDates(updatedReminderDates);
      localStorage.setItem('reminderDates', JSON.stringify(updatedReminderDates));
      console.log('Reminder deleted successfully for note with ID:', id);
  
      // Remove the reminder from the notes state
      const updatedNotes = [...notes];
      const noteIndex = updatedNotes.findIndex(note => note.id === id);
      if (noteIndex !== -1) {
        // Remove the reminder property from the note
        updatedNotes[noteIndex] = {
          ...updatedNotes[noteIndex],
          reminder: null // Assuming reminder is the property holding the reminder data
        };
        setNotes(updatedNotes);
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleToggleLabel = (noteId) => {
    setShowLabel((prevShowLabel) => ({
      ...prevShowLabel,
      [noteId]: !prevShowLabel[noteId],
    }));
  };

  const toggleLayoutMode = () => {
    setLayoutMode(prevMode => (prevMode === 'vertical' ? 'horizontal' : 'vertical'));
  };

  const toggleLabelDropdown = () => {
    setIsLabelDropdownOpen(!isLabelDropdownOpen);
  };

  const handleRemoveLabel = async (id,labelName) => {
    try {
      const updatedLabels = selectedLabels.filter((label) => label !== labelName);
      setSelectedLabels(updatedLabels);
      // Update the note without the removed label
      const updatedNote = { ...notes.find((note) => note.id === selectedNoteId) };
      updatedNote.labels = updatedLabels; 
      // Persist updated labels to local storage
      fetchNotes();
      localStorage.setItem('selectedLabels', JSON.stringify(updatedLabels));
      await noteService.removeNotesfromLabel(id, labelName,token);
      console.log(id,labelName);
    } catch (error) {
      console.error("Error removing label:", error);
    }
  };
  
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Load selected labels from local storage
    const storedLabels = JSON.parse(localStorage.getItem('selectedLabels')) || [];
    setSelectedLabels(storedLabels);
  }, []);
  
  
  useEffect(() => {
    fetchNotes();
  }, [token]);

  useEffect(() => {
    const storedColors = localStorage.getItem('noteColors');
    if (storedColors) {
      setSelectedColor(JSON.parse(storedColors));
    }

    const localStorageImages = JSON.parse(localStorage.getItem('noteImages')) || {};
    setNoteImages(localStorageImages);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isAddNoteOpen, newNote]);

  const fetchNotes = async () => {
    try {
      const data = await noteService.fetchNotes(token);
      setNotes(data.filter(note => !note.archive).filter(note => !note.trash));
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (newNote.title.trim() !== '' || newNote.description.trim() !== '') {
      try {
        await noteService.addNote({
          ...newNote,
          color: 'white' // Set the default color to white for new notes
        }, token);
        fetchNotes();
        setNewNote({ title: '', description: '' });
        setIsAddNoteOpen(false); // Close the add note section after adding the note
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const updateNote = async (id, updatedNote) => {
    try {
      await noteService.updateNote(id, updatedNote, token);
      setNotes(notes.map(note => (note.id === id ? updatedNote : note)));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const toggleAddNote = () => {
    setIsAddNoteOpen(!isAddNoteOpen);
  };

  const handleNoteTitleChange = (e) => {
    setNewNote({ ...newNote, title: e.target.value });
  };

  const handleNoteDescriptionChange = (e) => {
    setNewNote({ ...newNote, description: e.target.value });
  };

  const handleDocumentClick = (event) => {
    const addNoteElement =document.querySelector('.add-note');

    if (!addNoteElement.contains(event.target) && isAddNoteOpen) {
      if (newNote.title.trim() !== '' || newNote.description.trim() !== '') {
        addNote();
        setNewNote({ title: '', description: '' });
      }
      setIsAddNoteOpen(false);
    }
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
  
  const handleArchive = async (id) => {
    try {
      await noteService.setNoteToArchive(id, token);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const handleTrash = async (id) => {
    try {
      await noteService.setNoteToTrash(id, token);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error trashing note:', error);
    }
  };

  const handlePin = async id => {
    try {
      await noteService.pinNote(id, token);
      fetchNotes(); 
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const handleUnpin = async id => {
    try {
      await noteService.unPinNote(id, token);
      fetchNotes(); 
    } catch (error) {
      console.error('Error unpinning note:', error);
    }
  };

  const handleImageUpload = (event, id) => {
    try {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = () => {
        const imageUrl = reader.result;
        setNoteImages(prevImages => ({
          ...prevImages,
          [id]: imageUrl // Store the image URL with the note ID as the key
        }));
        // Store the note images in local storage
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
  
  // Function to handle deleting note images
  const handleDelete = (id) => {
    const updatedNoteImages = { ...noteImages };
    delete updatedNoteImages[id];
    setNoteImages(updatedNoteImages); // Update component state
    localStorage.setItem('noteImages', JSON.stringify(updatedNoteImages)); // Update local storage
  };

  
  const handleSearch = async (query) => {
    setSearchQuery(query); // Update search query state
    try {
      if (query.trim() === '') {
        fetchNotes(); // Fetch all notes again when search query is empty
      } else {
        const searchResults = await noteService.searchNotes(query, token); // Call searchNotes function
        setNotes(searchResults); // Update notes state with search results
      }
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  };


  return (
    <div className="App">
      <Header handleSearch={handleSearch} layoutMode={layoutMode} toggleLayoutMode={toggleLayoutMode} />
      <div className="main">
        <Sidebar />
        <div className="notes-container">
          <div className="add-note">
            {isAddNoteOpen ? (
              <>
                <div>
                  <Input
                    type="text"
                    placeholder="Title"
                    value={newNote.title}
                    onChange={handleNoteTitleChange}
                    autoFocus
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Take a note..."
                    value={newNote.description}
                    onChange={handleNoteDescriptionChange}
                  />
                </div>
              </>
            ) : (
              <div className="take-note" onClick={toggleAddNote}>
                Take a note...
              </div>
            )}
          </div>
          {/* Pinned notes */}
          <div className="pinned-notes-container">
          {pinnedNotes.length > 0 && (
            <div className="pinned-header" style={{ marginLeft: layoutMode === 'vertical' ? '0' : '272px'}}>
              <h2 style={{color:'#555'}}>PINNED</h2>
            </div>
          )}<div className='header-card'>
          {pinnedNotes.map(note => (
            <div key={note.id} className="note-card" style={{ marginLeft: layoutMode === 'vertical' ? '0' : '272px', width: layoutMode === 'vertical' ? '240px' : '51.4%', marginRight: layoutMode === 'horizontal' ? '20px' : '20px' }}>
              {/* Render pinned note */}
              <div>
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
      ><Tooltip title="Remove">
      <DeleteOutlinedIcon fontSize="small" /></Tooltip>
      </Button>
    </div>
  )}
</div>
  <Card className="card" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
    <CardBody className="note-card-body" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
    <CardTitle contentEditable suppressContentEditableWarning className="card-title" onBlur={(e) => updateNote(note.id, { ...note, title: e.target.innerText })}>{note.title}
     <Tooltip title="Unpin note"><FontAwesomeIcon icon={faThumbtack} style={{padding:8}} size="1x" className="pin-icon" onClick={() => handleUnpin(note.id)} /></Tooltip> 
    </CardTitle>
    <CardText contentEditable suppressContentEditableWarning className="card-text" onBlur={(e) => {
    if (!reminderDates[note.id]) {updateNote(note.id, { ...note, description: e.target.innerText });}}}>{note.description}</CardText>
    <div className='label-container'>
    {Object.keys(note.labelModelList).length > 0 && (
  <div>
    {Object.keys(note.labelModelList).map((labelId) => (
      <div key={labelId} className='label'>
        <span>{note.labelModelList[labelId].labelName}</span>
        <button className='label-button' onClick={() => handleRemoveLabel(note.id, note.labelModelList[labelId].labelName)}>
          <CloseOutlinedIcon fontSize="smaller" />
        </button>
      </div>
    ))}
  </div>
)}{showReminder[note.id] && ( <Reminder noteId={note.id}/>)}
</div><div>{note.reminder}</div>
{reminderDates[note.id] && (
  <ReminderTab
    reminder={new Date(reminderDates[note.id]).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(",", "")}
    onDelete={() => handleDeleteReminder(note.id)}
  />
)}
  <div className="button-container">
  <Button style={{padding:5}} onClick={() => handleTrash(note.id)}>
    <Tooltip title="Trash"> <DeleteOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}} onClick={() => handleArchive(note.id)}>
    <Tooltip title="Archive">  <ArchiveOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}} onClick={() => handleToggleCalendar(note.id)}>
    <Tooltip title="Remind me"> <AddAlertOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    {showCalendar[note.id] && (
      <div className="ReminderCard">
      <h className="reminder-title">Pick date & time</h>
        <div className="reminder-inputs">
          <div className="reminder-input-group">
            <label htmlFor="dateOfReminder">Select Date</label>
            <input type="date" id={`dateOfReminder-${note.id}`} name={`dateOfReminder-${note.id}`} className="reminder-input" min={getCurrentDate()}/>
          </div>
        <div className="reminder-input-group">
          <label htmlFor="remindertime">Select Time</label>
          <input type="time" id={`remindertime-${note.id}`} name={`remindertime-${note.id}`} className="reminder-input" />
        </div>
      <button style={{borderRadius:50,marginLeft:180,width:50,padding:7}} onClick={() => handleSetReminder(note.id)}>Save</button>
        </div>
      </div> )}
    <Button style={{padding:5}}><label htmlFor={`image-upload-${note.id}`}>
    <Tooltip title="Add Image"> <ImageOutlinedIcon fontSize="small" style={{cursor:'pointer'}} /></Tooltip> 
      <input id={`image-upload-${note.id}`} type="file" onChange={(e) => handleImageUpload(e, note.id)} style={{ display: 'none' }} /></label>
    </Button>
    <Button style={{padding:5}} onClick={() => handleColorIconClick(note.id)}>
    <Tooltip title="Background Options"> <PaletteOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}} onClick={() => handleToggleLabel(note.id)}>
    <Tooltip title="Add Label"><LocalOfferOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    {showLabel[note.id] && (<LabelCard onUpdate={fetchNotes} noteId={note.id} />)}
  </div>
  </CardBody>
</Card>
<div className="color-options" style={{ display: selectedNoteId === note.id ? 'block' : 'none' }}>
  <Card className="ColorCard">
    <CardBody className="ColorCardContainer">
      <div className="color-option" style={{ backgroundColor: 'white' }} onClick={() => handleColorChange(note.id, 'white')}></div>
      <div className="color-option" style={{ backgroundColor: '#EFB495' }} onClick={() => handleColorChange(note.id, '#EFB495')}></div>
       <div className="color-option" style={{ backgroundColor: '#EADFB4' }} onClick={() => handleColorChange(note.id, '#EADFB4')}></div>
      <div className="color-option" style={{ backgroundColor: '#9CAFAA' }} onClick={() => handleColorChange(note.id, '#9CAFAA')}></div>
      <div className="color-option" style={{ backgroundColor: '#D37676' }} onClick={() => handleColorChange(note.id, '#D37676')}></div>
      <div className="color-option" style={{ backgroundColor: '#A5DD9B' }} onClick={() => handleColorChange(note.id, '#A5DD9B')}></div>
      <div className="color-option" style={{ backgroundColor: '#F5DD61' }} onClick={() => handleColorChange(note.id, '#F5DD61')}></div>
      <div className="color-option" style={{ backgroundColor: '#FC819E' }} onClick={() => handleColorChange(note.id, '#FC819E')}></div>
      <div className="color-option" style={{ backgroundColor: '#7469B6' }} onClick={() => handleColorChange(note.id, '#7469B6')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFE6E6' }} onClick={() => handleColorChange(note.id, '#FFE6E6')}></div>
      <div className="color-option" style={{ backgroundColor: '#ADD8E6' }} onClick={() => handleColorChange(note.id, '#ADD8E6')}></div>
      <div className="color-option" style={{ backgroundColor: '#F0E68C' }} onClick={() => handleColorChange(note.id, '#F0E68C')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFDAB9' }} onClick={() => handleColorChange(note.id, '#FFDAB9')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFA07A' }} onClick={() => handleColorChange(note.id, '#FFA07A')}></div>
      <div className="color-option" style={{ backgroundColor: '#D9B9EB' }} onClick={() => handleColorChange(note.id, '#D9B9EB')}></div>
      <div className="color-option" style={{ backgroundColor: '#B9EBD9' }} onClick={() => handleColorChange(note.id, '#B9EBD9')}></div>
      <div className="color-option" style={{ backgroundColor: '#D9EBB9' }} onClick={() => handleColorChange(note.id, '#D9EBB9')}></div>
      <div className="color-option" style={{ backgroundColor: '#C8E6C9' }} onClick={() => handleColorChange(note.id, '#C8E6C9')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFD3E0' }} onClick={() => handleColorChange(note.id, '#FFD3E0')}></div>
      <div className="color-option" style={{ backgroundColor: '#C9CCF0' }} onClick={() => handleColorChange(note.id, '#C9CCF0')}></div>
    </CardBody>
  </Card>
  </div>
  </div>            
  ))}</div>
  </div>
  <div className="unpinned-notes-container">
          {/* Unpinned notes */}
          {pinnedNotes.length > 0 && (
    <div className="unpinned-header" style={{ marginLeft: layoutMode === 'vertical' ? '0' : '272px'}}>
      <h2 style={{color:'#555'}}>OTHERS</h2>
    </div>
  )}<div className='header-card'>
          {unpinnedNotes.map(note => (
            <div key={note.id} className="note-card"  style={{ marginLeft: layoutMode === 'vertical' ? '0' : '272px',  width: layoutMode === 'vertical' ? '240px' : '51.4%', marginRight: layoutMode === 'horizontal' ? '12px' : '20px' }}>
              {/* Render unpinned note */}
              <div style={{ position: 'relative' }}>
  {noteImages[note.id] && (
    <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden' }}>
      <img src={noteImages[note.id]} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <Button
        className="delete-button"
        style={{backgroundColor:'transparent',cursor:'pointer', border:'none', position: 'absolute', bottom: '5px', right: '5px' }}
        outline
        size="sm"
        onClick={() => handleDelete(note.id)}
        title="Permanently Delete"
      ><Tooltip title="Remove">
        <DeleteOutlinedIcon fontSize="small" /></Tooltip>
      </Button>
    </div>
    )}
  </div>  
  <Card className="card" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
  <CardBody className="note-card-body"  style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
  <CardTitle contentEditable suppressContentEditableWarning className="card-title" onBlur={(e) => updateNote(note.id, { ...note, title: e.target.innerText })}>
  <div>
    <Tooltip title="Pin note">
     <PushPinOutlinedIcon style={{padding:5,fontSize:30}} fontSize="medium" className="pin-icon" onClick={() => handlePin(note.id)} />
    </Tooltip>{note.title}
  </div>
</CardTitle>
<CardText contentEditable suppressContentEditableWarning className="card-text" onBlur={(e) => {
    if (!reminderDates[note.id]) {
        updateNote(note.id, { ...note, description: e.target.innerText });
    }
}}>
    {note.description}
</CardText>
<div className='label-container'>
    {Object.keys(note.labelModelList).length > 0 && (
        <div className='label'>
            {Object.keys(note.labelModelList).map((labelId) => (
                <React.Fragment key={labelId}>
                    <span>{note.labelModelList[labelId].labelName}</span>
                    <Tooltip title="Remove Label">
                        <button className='label-button' onClick={() => handleRemoveLabel(note.id,note.labelModelList[labelId].labelName)}>
                            <CloseOutlinedIcon fontSize="smaller" />
                        </button>
                    </Tooltip>
                </React.Fragment>
            ))}
        </div>
    )}
</div>
{reminderDates[note.id] && (
  <ReminderTab
    reminder={new Date(reminderDates[note.id]).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(",", "")}
    onDelete={() => handleDeleteReminder(note.id)}
  />
)}
  <div className="button-container" style={{marginTop:20}}>
    <Button style={{padding:5}} onClick={() => handleTrash(note.id)} >
    <Tooltip title="Trash"> <DeleteOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}} onClick={() => handleArchive(note.id)}>
    <Tooltip title="Archive">  <ArchiveOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}} onClick={() => handleToggleCalendar(note.id)}>
    <Tooltip title="Remind me"> <AddAlertOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    {showCalendar[note.id] && (
      <div className="ReminderCard">
      <h className="reminder-title">Pick date & time</h>
        <div className="reminder-inputs">
          <div className="reminder-input-group">
            <label htmlFor="dateOfReminder">Select Date</label>
            <input type="date" id={`dateOfReminder-${note.id}`} name={`dateOfReminder-${note.id}`} className="reminder-input" min={getCurrentDate()}/>
          </div>
        <div className="reminder-input-group">
          <label htmlFor="remindertime">Select Time</label>
          <input type="time" id={`remindertime-${note.id}`} name={`remindertime-${note.id}`} className="reminder-input" />
        </div>
      <button style={{borderRadius:50,marginLeft:180,width:50,padding:7}} onClick={() => handleSetReminder(note.id)}>Save</button>
        </div>
      </div> )}
    <Button style={{padding:5}}><label htmlFor={`image-upload-${note.id}`}>
    <Tooltip title="Add Image"> <ImageOutlinedIcon fontSize="small" style={{cursor:'pointer'}} /></Tooltip> 
      <input id={`image-upload-${note.id}`} type="file" onChange={(e) => handleImageUpload(e, note.id)} style={{ display: 'none' }} /></label>
    </Button>
    <Button style={{padding:5}} onClick={() => handleColorIconClick(note.id)}>
    <Tooltip title="Background Options"> <PaletteOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}} onClick={() => handleToggleLabel(note.id)}>
    <Tooltip title="Add Label"><LocalOfferOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    {showLabel[note.id] && (<LabelCard onUpdate={fetchNotes} noteId={note.id} />
 )}
  </div>
</CardBody>
</Card>
<div className="color-options" style={{ display: selectedNoteId === note.id ? 'block' : 'none' }}>
  <Card className="ColorCard">
  <CardBody className="ColorCardContainer">
      <div className="color-option" style={{ backgroundColor: 'white' }} onClick={() => handleColorChange(note.id, 'white')}></div>
      <div className="color-option" style={{ backgroundColor: '#EFB495' }} onClick={() => handleColorChange(note.id, '#EFB495')}></div>
      <div className="color-option" style={{ backgroundColor: '#EADFB4' }} onClick={() => handleColorChange(note.id, '#EADFB4')}></div>
      <div className="color-option" style={{ backgroundColor: '#9CAFAA' }} onClick={() => handleColorChange(note.id, '#9CAFAA')}></div>
      <div className="color-option" style={{ backgroundColor: '#D37676' }} onClick={() => handleColorChange(note.id, '#D37676')}></div>
      <div className="color-option" style={{ backgroundColor: '#A5DD9B' }} onClick={() => handleColorChange(note.id, '#A5DD9B')}></div>
      <div className="color-option" style={{ backgroundColor: '#F5DD61' }} onClick={() => handleColorChange(note.id, '#F5DD61')}></div>
      <div className="color-option" style={{ backgroundColor: '#FC819E' }} onClick={() => handleColorChange(note.id, '#FC819E')}></div>
      <div className="color-option" style={{ backgroundColor: '#7469B6' }} onClick={() => handleColorChange(note.id, '#7469B6')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFE6E6' }} onClick={() => handleColorChange(note.id, '#FFE6E6')}></div>
      <div className="color-option" style={{ backgroundColor: '#ADD8E6' }} onClick={() => handleColorChange(note.id, '#ADD8E6')}></div>
      <div className="color-option" style={{ backgroundColor: '#F0E68C' }} onClick={() => handleColorChange(note.id, '#F0E68C')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFDAB9' }} onClick={() => handleColorChange(note.id, '#FFDAB9')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFA07A' }} onClick={() => handleColorChange(note.id, '#FFA07A')}></div>
      <div className="color-option" style={{ backgroundColor: '#D9B9EB' }} onClick={() => handleColorChange(note.id, '#D9B9EB')}></div>
      <div className="color-option" style={{ backgroundColor: '#B9EBD9' }} onClick={() => handleColorChange(note.id, '#B9EBD9')}></div>
      <div className="color-option" style={{ backgroundColor: '#D9EBB9' }} onClick={() => handleColorChange(note.id, '#D9EBB9')}></div>
      <div className="color-option" style={{ backgroundColor: '#C8E6C9' }} onClick={() => handleColorChange(note.id, '#C8E6C9')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFD3E0' }} onClick={() => handleColorChange(note.id, '#FFD3E0')}></div>
      <div className="color-option" style={{ backgroundColor: '#C9CCF0' }} onClick={() => handleColorChange(note.id, '#C9CCF0')}></div>
    </CardBody>
  </Card>
</div>
  </div>
 ))}</div>
    </div>
  </div>
  </div>
</div>
  );
};

export default Note;
