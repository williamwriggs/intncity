import authMiddleware from "./authMiddleware"
import logMiddleware from "./logMiddleware"

export default function useMiddleware(request, response) {

    const auth = authMiddleware(request, response)

    logMiddleware(request, response, auth)

    return {
        auth: auth
    }
}