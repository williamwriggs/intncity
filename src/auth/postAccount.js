import signedFetch from "./signedFetch"

export default async function postAccount(name, email, provider) {
    let error

    console.log("user: ", name, email)
    
    const res = await signedFetch("/api/account", {
        method: "POST",
        body: JSON.stringify({
            name,
            email
        }),
        provider
    }).catch((err) => {
        error = err
    })

    if(res.status === 409 || res.status === 201) {
        return true
    }

    if (error !== undefined) {
        console.error(err)
        return false
    }

}