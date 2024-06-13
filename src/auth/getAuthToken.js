import sign from "./sign"
import Web3 from "web3"

export default async function getAuthToken(provider, url) {
    
    const web3 = new Web3(provider);
    const address = (await web3.eth.getAccounts())[0]
    const time = Date.now()

    const signature = await sign(provider, url + time)

    const token = address + "." + signature + "." + time

    return token
}