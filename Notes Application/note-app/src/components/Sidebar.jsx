import React, { useState } from "react";
import reminder from "./../assets/icons/reminder.png";
import trashed from "./../assets/icons/trashed.png";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import "./../styles/note.css";
import { Link, useLocation } from "react-router-dom";
import Modal from "react-modal";
import Label from "./Label";

const Sidebar = () => {
  const location = useLocation();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    setModalIsOpen(false);
    document.body.classList.remove("modal-open");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <div style={{color:"black"}} className={location.pathname === "/note" ? "active" : ""}>
          <Link to="/note">
            <LightbulbOutlinedIcon fontSize="medium" style={{color:'#555', marginLeft:15}} className="option-icon"  />
            Notes
          </Link>
        </div>
        <div style={{color:"black"}} className={location.pathname === "/Reminder" ? "active" : ""}>
          <Link to="/Reminder">
            <img src={reminder} alt="Reminder Icon" style={{color:'#555', marginLeft:15}} className="option-icon" />
            Reminders
          </Link>
        </div>
        <div style={{color:"black"}} className={location.pathname === "/label" ? "active" : ""}>
          <Link onClick={openModal}>
          <EditOutlinedIcon fontSize="medium" style={{color:'#555', marginLeft:15}} className="option-icon" />
            Edit Labels
          </Link>
        </div>
        <div style={{color:"black"}} className={location.pathname === "/Archive" ? "active" : ""}>
          <Link to="/Archive">
          <ArchiveOutlinedIcon fontSize="medium" style={{color:'#555', marginLeft:15}} className="option-icon"/>
            Archive
          </Link>
        </div>
        <div style={{color:"black"}} className={location.pathname === "/Trash" ? "active" : ""}>
          <Link to="/Trash">
            <img src={trashed} alt="Trash Icon" style={{color:'#555', marginLeft:15}} className="option-icon" />
            Bin
          </Link>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Label Modal"
        className="label-modal"
        overlayClassName="label-modal-overlay"
        shouldCloseOnOverlayClick={true}
      >
        <Label onUpdate={closeModal} />
      </Modal>
    </div>
  );
};

export default Sidebar;
