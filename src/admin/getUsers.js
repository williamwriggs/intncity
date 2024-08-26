import signedFetch from "@/auth/signedFetch"

export default async function getUsers(provider, options) {

    const params = new URLSearchParams()
    params.append("offset", options.offset || "")

    const search = options.search
    if(search) {
        params.append("search", search)
    }

    const url = "/api/users?" + params.toString()
    
    const res = await signedFetch(url, {
        provider
    })

    console.log(res)

    const users = await res.json().catch(console.error)

    console.log('users')
    console.log(users)

    return users
}