import useMiddleware from "../middleware/useMiddleware"
import getAccount from "../utils/getAccount"

export default async function route(request, response) {

    const ctx = useMiddleware(request, response)
    const account = await getAccount(ctx.auth).catch(console.error)
    console.log(account || "no account")

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