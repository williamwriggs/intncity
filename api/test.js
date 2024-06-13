import authMiddleware from "../middleware/authMiddleware"

export default function route(request, response) {

    const [value, auth] = authMiddleware(request, response)

    console.log(value, auth)

    switch (request.method) {
        case "GET": {
            response.status(200).send('success')
        }
    }
}