import Web3 from "web3"

export default  function recover(message, signature) {
    console.temp = console.warn
    console.warn = () => {}
    const web3 = new Web3()
    console.warn = console.temp

    const address = web3.eth.accounts.recover(message, signature)

    return address
}