import recover from "../src/auth/recover"

export default function authMiddleware(request, response) {
    const authToken = request.headers.authorization?.split('.')

    
    if (authToken?.length !== 3) {
        return ["invalid auth token", false]
    }
    
    const address = authToken[0]
    const signature = authToken[1]
    const time = authToken[2] || 0

    const timeSinceSignature = Date.now() - time

    if (timeSinceSignature > 5000) {
        return ["request time expired", false]
    }

    const recoveredAddress = recover(request.url + time, signature)

    if (address === recoveredAddress) {
        return [recoveredAddress, true]
    }

    return ["invalid auth token", false]
}