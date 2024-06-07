import Web3 from "web3"


export default async function sign(provider, message) {
    if(!provider) {
        console.error("must pass in provider")
        return
    }
    if(!message) {
        console.error("must pass in message")
        return
    }

    const web3 = new Web3(provider);
    
    const fromAddress = (await web3.eth.getAccounts())[0]

    const signature = await web3.eth.personal.sign(
        message,
        fromAddress,
        ""
    )

    return signature
}