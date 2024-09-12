import { useAuth } from '@/auth/Hooks';
import { useEffect, useState } from 'react';
import getUnapprovedTrees from '@/admin/getUnapprovedTrees';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Input, Button, CircularProgress } from '@mui/material';
import * as React from 'react';

export default function TreeListDisplay({
    trees, setTrees,
    offsets, setOffsets,
    search, setSearch,
    page, setPage,
    lastPage, setLastPage,
    treesError, setTreesError,
}) {

    const [searchString, setSearchString] = useState()
    const [loading, setLoading] = useState(false)
    const auth = useAuth();

    let currentSearch = null;
    let currentOffset = null;

    useEffect(() => {
        console.log(page)
        console.log(lastPage)
    }, [lastPage])


    const handleOffset = (offset, newPage) => {
        if(offset === "") {
            setLastPage(newPage)
            console.log(page)
            console.log(lastPage)
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


    const getUnapprovedTreesPage = async (search, offset, reset, newPage) => {
        setLoading(true)
        try {
            const t = await getUnapprovedTrees(auth.provider, {
                offset,
                search
            })
            if(reset) {
                setTrees([t.records])
                setOffsets([t.offset])
                setPage(0)
                if(t.offset === "") {
                    setLastPage(0)
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
    }

    useEffect(() => {
        console.log(trees)
    }, [trees])
    
    const resetTrees = () => {
        setTrees([])
        setOffsets([])
        setSearch([])
        setPage(0)
        setLastPage(undefined)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setSearch(searchString)
        const s = searchString === "" ? null : searchString
        getUnapprovedTreesPage(s, null, true, 0)
        setLastPage(undefined)
    }

    const handleNext = async () => {
        if(page === lastPage) {
            return
        }
        let newPage = page + 1
        if(!trees[page + 1]?.length) {
            await getUnapprovedTreesPage(currentSearch, offsets[offsets.length - 1], undefined, newPage)
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
        if(auth.provider && auth.connected && !trees.length) {
            console.log("fetching...")
            console.log(auth)
            getUnapprovedTreesPage(search, offsets[offsets?.length - 1] || null)
        }
    }, [auth, trees])

    return (
        <>
        <form style={{textAlign: "right"}} onSubmit={handleSearch}>
            <Input placeholder={"Search by email..."} sx={{marginBottom: "20px", marginRight: "20px"}} value={searchString} onChange={(e) => {
                setSearchString(e.target.value)
            }}/>
            <Button color="secondary" type="submit" variant="contained" sx={{borderRadius: "5px"}}>Go</Button>
        </form>
        { loading ? 
            <Box sx={{display: "flex", height: "60vh", textAlign: "center", margin: "auto"}}>
            <CircularProgress color="primary" size="small" />
            </Box>
            :
            <>
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
                {trees[page]?.map((row) => (
                    <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
                        setTrees([])
                        resetTrees()
                        getUnapprovedTreesPage(null, null, true)
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