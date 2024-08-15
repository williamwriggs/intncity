import signedFetch from "@/auth/signedFetch"

export default async function getUsers(provider, options) {

    const searchString = options.search ? "search=" + options.search : ""
    const pageString = options.page ? "page=" + (options.page - 1) : ""
    const connector = options.page && options.search ? "&" : ""

    const url = "/api/users?" + searchString + connector + pageString
    
    const res = await signedFetch(url, {
        provider
    })

    const users = await res.json()

    return users
}