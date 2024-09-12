import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

export default function GenericModal({ children }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const modalPageStyle = {
        width: "80vw",
        backgroundColor: "white",
        borderRadius: "10px",
        height: "80vh",
        margin: "auto",
        padding: "2vw"
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
        <>
        <Button onClick={handleOpen}>Open modal</Button>
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
        </>
    )
}

