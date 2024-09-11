import { useAuth } from '@/auth/Hooks';
import { useEffect, useState } from 'react';
import getUnapprovedTrees from '@/admin/getUnapprovedTrees';
import { Box, Typography } from '@mui/material';

export default function TreeListDisplay() {
    const auth = useAuth();
    const [trees, setTrees] = useState();
    const [treesError, setTreesError] = useState(null);



    const getUnapprovedTreesPage = async () => {
        try {
            const t = await getUnapprovedTrees(auth.provider, {
                offset: null,
                search: "peej@oleary.com"
            })
            setTrees(t)
        } catch {
            setTreesError("error getting trees page")
        }
    }

    useEffect(() => {
        if(auth.provider && auth.connected && !trees) {
            console.log("fetching...")
            console.log(auth)
            getUnapprovedTreesPage()
        }
    }, [auth])

    return (
        <Box>
            <Typography>Trees</Typography>
        </Box>
    )
}