import signedFetch from "@/auth/signedFetch"

export default async function getTreesPage(provider, options) {

    const params = new URLSearchParams()

    const offset = options.offset
    if(offset) {
        params.append("offset", offset)
    }
    const search = options.search
    if(search) {
        params.append("search", search)
    }
    const approved = options.approved
    params.append("unapproved", approved)

    const url = "/api/request?" + params.toString()
    
    const res = await signedFetch(url, {
        provider
    })


    const unapprovedTrees = await res.json().catch(console.error)


    return unapprovedTrees
}