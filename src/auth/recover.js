import Web3 from "web3"

export default async function recover(provider, message, signature) {
    const web3 = new Web3()

    const address = await web3.eth.accounts.recover(message, signature)

    return address
}