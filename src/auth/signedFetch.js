import Web3 from "web3"
import sign from "./sign"

export default async function signedFetch(url, options = {}) {

    let web3, provider, error

    try {
        if(!options.provider) throw new Error()
        provider = options.provider
        web3 = new Web3(provider)
    } catch {
        error = new Error("error: signedFetch must take a valid ethereum private key provider as options.provider")
    }

    if(error !== undefined) {
        throw error
    }

    delete options.provider

    const method = options.method || "GET"

    let time = Date.now()

    let signerData

    switch(method) {
        case "GET":  {
            signerData = new URL(url, "http://localhost:3000").search + time
            break
        }
        default: {
            signerData = options.body + time
            break
        }
    }

    let signedData, address

    try {
        signedData = await sign(provider, signerData)
        address = (await web3.eth.getAccounts())[0]
    } catch(e) {
        console.error(e)
        error = new Error('error: unable to sign data or retrieve account, internal error')
    }

    if(error !== undefined) {
        throw error
    }


    options.headers = options.headers || {}
    options.headers["Authorization"] = "Bearer " + address + "." + time + "." + signedData

    const res = await fetch(url, options)
    
    return res
}
