import recover from "../src/auth/recover"

export default function authMiddleware(request) {

    let authToken
    try {
        authToken = request.headers.authorization.split(' ')[1].split(".")
    } catch {
        return null
    }
    
    const address = authToken[0]
    const time = authToken[1] || 0
    const signature = authToken[2]

    const timeSinceSignature = Date.now() - time

    if (timeSinceSignature > 5000) {
        console.error('error: request signature expired')
        return null
    }

    let signerString

    switch(request.method) {
        case "GET": {
            signerString = new URL(request.url, "http://localhost:3000").search + time
            break
        }

        default: {
            signerString = request.body + time
            break
        }

    }

    const recoveredAddress = recover(signerString, signature)


    if (address === recoveredAddress) {
        return recoveredAddress
    }

    return null
}