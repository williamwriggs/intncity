import { useAuth } from '@/auth/Hooks';
import { useEffect, useState } from 'react';
import getUsers from '@/admin/getUsers';

const UserListDisplay = () => {
    const auth = useAuth();
    const [users, setUsers] = useState();
    const [usersError, setUsersError] = useState(null);



    const getUserPage = async () => {
        try {
            const u = await getUsers(auth.provider, {
                page: 1,
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

}