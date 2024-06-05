export default function route(request, response) {
    switch (request.method) {
        case "GET": {
            response.status(200).send('success')
        }
    }
}