export default function logMiddleware(request, response, auth, value) {
    const send = response.send
    const start = Date.now()
    response.send = (message) => {
        const method = request.method
        const status = response.statusCode
        const endpoint = new URL(request.url, "http://localhost:3000").pathname
        const ip = request.headers["x-forwarded-for"]
        const finish = Date.now()
        const ms = finish - start
        const time = new Date(start).toJSON()

        send(message)
    }
}