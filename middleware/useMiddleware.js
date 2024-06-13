import authMiddleware from "./authMiddleware"
import logMiddleware from "./logMiddleware"

export default function useMiddleware(request, response) {

    const [value, auth] = authMiddleware(request, response)

    logMiddleware(request, response, auth, value)

    return {
        authValue: value,
        auth: auth
    }
}