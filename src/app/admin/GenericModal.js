import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

export default function GenericModal({ children, open, handleClose }) {

    const modalPageStyle = {
        width: "80vw",
        backgroundColor: "white",
        borderRadius: "10px",
        height: "80vh",
        margin: "auto",
        padding: "20px",
        overflow: "scroll"
    }

    const closeIconStyle = {
        color: "white",
        height: "7vh",
        cursor: "pointer"
    }

    const closeIconWrapperStyle = {
        width: "100vw",
        textAlign: "right",
        paddingRight: "10px"
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <>  
                <div onClick={handleClose} style={closeIconWrapperStyle}>
                    <CloseIcon sx={closeIconStyle}/>
                </div>
                <Box sx={modalPageStyle}>
                    {children}
                </Box>
            </>
        </Modal>
    )
}

