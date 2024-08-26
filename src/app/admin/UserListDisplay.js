import { useAuth } from '@/auth/Hooks';
import { useEffect, useState } from 'react';
import getUsers from '@/admin/getUsers';
import { Box, Typography } from '@mui/material';

export default function UserListDisplay() {
    const auth = useAuth();
    const [users, setUsers] = useState();
    const [usersError, setUsersError] = useState(null);



    const getUserPage = async () => {
        try {
            const u = await getUsers(auth.provider, {
                offset: "itrwYPZYjvuRuWAtQ/recuuhj56jOgqGESg",
                search: null
            })
            setUsers(u)
        } catch {
            setUsersError("error getting users page")
        }
    }

    useEffect(() => {
        if(auth.provider && auth.connected && !users) {
            getUserPage()
        }
    }, [auth])

    return (
        <Box>
            <Typography>Users</Typography>
        </Box>
    )
}