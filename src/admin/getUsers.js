import signedFetch from "@/auth/signedFetch"

export default async function getUsers(provider, options) {

    const params = new URLSearchParams()

    const offset = options.offset
    if(offset) {
        params.append("offset", offset)
    }

    const search = options.search
    if(search) {
        params.append("search", search)
    }

    const url = "/api/users?" + params.toString()
    
    const res = await signedFetch(url, {
        provider
    })


    const users = await res.json().catch(console.error)


    return users
}