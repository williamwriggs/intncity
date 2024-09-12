import { useAuth } from '@/auth/Hooks';
import { useEffect, useState } from 'react';
import getUnapprovedTrees from '@/admin/getUnapprovedTrees';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import * as React from 'react';

export default function UserListDisplay({state}) {
    const auth = useAuth();
    const [users, setUsers] = useState(state?.users || []);
    const [offsets, setOffsets] = useState(state?.offsets || []);
    const [search, setSearch] = useState(state?.search || []);
    const [page, setPage] = useState(state?.page || 0)
    const [lastPage, setLastPage] = useState(state?.lastPage || 0)
    const [usersError, setUsersError] = useState(null);

    const handleOffset = (offset) => {
        if(offset === "") {
            setLastPage(page)
        } else {
            let found = false
            for(let i = 0; i < offsets.length; i++) {
                if(offsets[i] == offset) {
                    found = true
                    setPage(i)
                }
            }
        }

    }


    const getUserPage = async () => {
        try {
            const u = await getUsers(auth.provider, {
                offset,
                search
            })
            setUsers(u.records)
            handleOffset(u.offset)
        } catch {
            setUsersError("error getting users page")
        }
    }

    useEffect(() => {
        if(auth.provider && auth.connected && !users.length) {
            getUserPage()
        }
    }, [auth])

    return (
        <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
            <TableRow>
                <TableCell>Dessert (100g serving)</TableCell>
                <TableCell align="right">Calories</TableCell>
                <TableCell align="right">Fat&nbsp;(g)</TableCell>
                <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                <TableCell align="right">Protein&nbsp;(g)</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {users.map((row) => (
                <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell component="th" scope="row">
                    {row.name}
                </TableCell>
                <TableCell align="right">{row.fields}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.carbs}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
    )
}