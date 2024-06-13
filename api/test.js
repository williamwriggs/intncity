import useMiddleware from "../middleware/useMiddleware"

export default function route(request, response) {

    const ctx = useMiddleware(request, response)

    switch (request.method) {
        case "GET": {
            if(ctx.auth) response.status(200).send('get success')
            if(!ctx.auth) response.status(401).send('no authentication')
            break
        }

        case "POST": {
            if(ctx.auth) response.status(200).send('post success')
            if(!ctx.auth) response.status(401).send('no authentication')
            break
        }
    }
}