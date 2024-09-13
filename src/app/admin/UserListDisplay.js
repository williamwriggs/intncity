import { useAuth } from '@/auth/Hooks';
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Input, Button, CircularProgress } from '@mui/material';
import * as React from 'react';
import getUsers from '@/admin/getUsers';
import UserModal from './UserModal';

export default function UserListDisplay({
    users, setUsers,
    offsets, setOffsets,
    search, setSearch,
    page, setPage,
    lastPage, setLastPage,
    usersError, setUsersError,
    usersLoading, setUsersLoading
}) {

    const [searchString, setSearchString] = useState(search || "")
    const [loading, setLoading] = useState(usersLoading || false)
    const [userModalOpen, setUserModalOpen] = useState(false)
    const [modalUser, setModalUser] = useState(null)
    const auth = useAuth();

    let currentSearch = null;
    let currentOffset = null;
    
    const handleUserModalClose = () => {
        setModalUser(null)
        setUserModalOpen(false)
    }

    useEffect(() => {
        console.log(page)
        console.log(lastPage)
    }, [lastPage])
    
    const approveRow = () => {
        resetUsers()
        handleUserModalClose()
    }

    const handleOffset = (offset, newPage) => {
        if(offset === "") {
            setLastPage(newPage || 0)
        }
        let found = false
        for(let i = 0; i < offsets.length; i++) {
            if(offsets[i] == offset) {
                found = true
                setPage(i)
            }
        }
        if(!found) {
            setOffsets([...offsets, offset])
        }
    }


    const getUsersPage = async (search, offset, reset, newPage) => {
        setLoading(true)
        setUsersLoading(true)
        try {
            const u = await getUsers(auth.provider, {
                offset,
                search
            })
            if(reset) {
                setUsers([u.records])
                setOffsets([u.offset])
                setPage(0)
                setSearch("")
                if(u.offset === "") {
                    setLastPage(0)
                } else {
                    setLastPage(undefined)
                }
            } else {
                setUsers([...users, u.records])
                handleOffset(u.offset, newPage)
            }
            currentSearch = search
            currentOffset = u.offset
        } catch {
            setUsersError("error getting users page")
        }
        setLoading(false)
        setUsersLoading(false)
    }

    useEffect(() => {
        console.log(users)
    }, [users])
    
    const resetUsers = () => {
        getUsersPage(null, null, true, 0)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setSearch(searchString)
        const s = searchString === "" ? null : searchString
        getUsersPage(s, null, true, 0)
    }

    const handleNext = async () => {
        if(page === lastPage) {
            return
        }
        let newPage = page + 1
        if(!users[page + 1]?.length) {
            await getUsersPage(currentSearch, offsets[offsets.length - 1], undefined, newPage)
        }
        setPage(newPage)
    }

    const handleBack = () => {
        if(page === 0) {
            return
        }
        setPage(page - 1)
    }
    
    useEffect(() => {
        if(auth.provider && auth.connected && !users.length) {
            console.log("fetching...")
            console.log(auth)
            getUsersPage(search, offsets[offsets?.length - 1] || null)
        }
    }, [auth, users])

    return (
        <>
        <form style={{textAlign: "right"}} onSubmit={handleSearch}>
            <Input placeholder={"Search by email..."} sx={{marginBottom: "20px", marginRight: "20px"}} value={searchString} onChange={(e) => {
                setSearchString(e.target.value)
            }}/>
            <Button color="secondary" type="submit" variant="contained" sx={{borderRadius: "5px"}}>Go</Button>
        </form>
        { loading ? 
            <Box sx={{display: "block", height: "60vh", textAlign: "center", margin: "auto"}}>
            <Typography>Loading...</Typography>
            <CircularProgress color="primary" size="sm" />
            </Box>
            :
            <>
            <UserModal open={userModalOpen} user={modalUser} handleClose={handleUserModalClose} approveFunction={approveRow}/>
            <TableContainer component={Paper} sx={{width: "100%", maxHeight: "40vh"}}>
            <Table sx={{width: "100%"}} size="small" aria-label="simple table">
                <TableHead>
                <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Auth Level</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {users[page]?.map((row) => (
                    <TableRow
                    key={row.id}
                    onClick={() => {
                        setModalUser(row)
                        setUserModalOpen(true)
                    }}
                    sx={{ cursor: "pointer", '&:last-child td, &:last-child th': { border: 0 }, '&:hover': {backgroundColor: "whitesmoke"} }}
                    >
                        <TableCell component="th" scope="row">
                            {row.fields["email"]}
                        </TableCell>
                        <TableCell align="right">{row.fields["auth_level"]}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr"}}>
                <div style={{textAlign: "left"}}>
                    {page !== 0 && <Button onClick={handleBack}>Back</Button>}
                </div>
                <div style={{textAlign: "center"}}>
                    <Button onClick={() => {
                        resetUsers()
                    }}>Reset</Button>
                </div>
                <div style={{textAlign: "right"}}>
                    {page !== lastPage && <Button onClick={handleNext}>Next</Button>}
                </div>
            </div>
            </>
        }
        </>
    )
}