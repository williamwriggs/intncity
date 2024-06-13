import Web3 from "web3"

export default  function recover(message, signature) {
    const web3 = new Web3()

    const address = web3.eth.accounts.recover(message, signature)

    return address
}