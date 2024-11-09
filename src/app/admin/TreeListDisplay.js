import { useAuth } from '@/auth/Hooks';
import { useEffect, useState } from 'react';
import getTreesPage from '@/admin/getTreesPage';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Input, Button, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import * as React from 'react';
import TreeModal from './TreeModal';

export default function TreeListDisplay({
    trees, setTrees,
    offsets, setOffsets,
    search, setSearch,
    page, setPage,
    lastPage, setLastPage,
    treesError, setTreesError,
    treesLoading, setTreesLoading,
    approved, setApproved
}) {

    const [searchString, setSearchString] = useState(search || "")
    const [loading, setLoading] = useState(treesLoading || false)
    const [treeModalOpen, setTreeModalOpen] = useState(false)
    const [modalTree, setModalTree] = useState(null)
    const auth = useAuth();

    let currentSearch = null;
    let currentOffset = null;

    const handleTreeModalClose = () => {
        setModalTree(null)
        setTreeModalOpen(false)
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


    const fetchTreesPage = async (search, offset, reset, newPage, approvedOverride) => {
        if(approvedOverride === undefined) {
            approvedOverride = approved
        }
        setLoading(true)
        setTreesLoading(true)
        try {
            const t = await getTreesPage(auth.provider, {
                offset,
                search,
                approved: approvedOverride
            })
            if(reset) {
                setTrees([t.records])
                setOffsets([t.offset])
                setPage(0)
                setSearch("")
                if(t.offset === "") {
                    setLastPage(0)
                } else {
                    setLastPage(undefined)
                }
            } else {
                setTrees([...trees, t.records])
                handleOffset(t.offset, newPage)
            }
            currentSearch = search
            currentOffset = t.offset
        } catch {
            setTreesError("error getting trees page")
        }
        setLoading(false)
        setTreesLoading(false)
    }

    const approveRow = () => {
        resetTrees()
        handleTreeModalClose()
    }

    const resetTrees = () => {
        fetchTreesPage(null, null, true, 0)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setSearch(searchString)
        const s = searchString === "" ? null : searchString
        fetchTreesPage(s, null, true, 0)
    }

    const handleNext = async () => {
        if(page === lastPage) {
            return
        }
        let newPage = page + 1
        if(!trees[page + 1]?.length) {
            await fetchTreesPage(currentSearch, offsets[offsets.length - 1], undefined, newPage)
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
        if(auth.provider && auth.connected && !trees.length && !treesLoading) {
            fetchTreesPage(search, offsets[offsets?.length - 1] || null)
        }
    }, [auth, trees])

    return (
        <>
        <>
            <form style={{textAlign: "left", paddingBottom: "0"}} onSubmit={handleSearch}>
                <Input placeholder={"Search by email..."} sx={{marginBottom: "5px", marginRight: "20px"}} value={searchString} onChange={(e) => {
                    setSearchString(e.target.value)
                }}/>
                <Button color="secondary" type="submit" variant="contained" sx={{borderRadius: "5px"}}>Go</Button>
            </form>
            <div style={{textAlign: "right"}}>
                <FormControlLabel control={<Checkbox sx={{margin: "10px", padding: "0", marginRight: "5px"}} checked={approved} onChange={(e) => {
                    setApproved(!approved)
                    fetchTreesPage(search, undefined, true, undefined, !approved);
                }}/>} label={"All trees"}/>
            </div>
        </>
        { loading ? 
            <Box sx={{display: "block", height: "60vh", textAlign: "center", margin: "auto"}}>
            <Typography>Loading...</Typography>
            <CircularProgress color="primary" size="small" />
            </Box>
            :
            <>
            <TreeModal open={treeModalOpen} tree={modalTree} handleClose={handleTreeModalClose} approveFunction={approveRow} />
            <TableContainer component={Paper} sx={{width: "100%", maxHeight: "40vh"}}>
            <Table sx={{width: "100%"}} size="small" aria-label="simple table">
                <TableHead>
                <TableRow>
                    <TableCell>Planter Email</TableCell>
                    <TableCell align="right">Address</TableCell>
                    <TableCell align="right">Tree Name</TableCell>
                    <TableCell align="right">Tree Category</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {trees[page]?.map((row, index) => (
                    <TableRow
                    key={row.id}
                    onClick={() => {
                        setModalTree(row)
                        setTreeModalOpen(true)
                    }}
                    sx={{ cursor: "pointer", '&:last-child td, &:last-child th': { border: 0 }, '&:hover': {backgroundColor: "whitesmoke"} }}
                    >
                        <TableCell component="th" scope="row">
                            {row.fields["Requestor Email"][0]}
                        </TableCell>
                        <TableCell align="right">{row.fields["Location Address"]}</TableCell>
                        <TableCell align="right">{row.fields["Tree Name"]}</TableCell>
                        <TableCell align="right">{row.fields["Tree Category"]}</TableCell>
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
                        resetTrees()
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