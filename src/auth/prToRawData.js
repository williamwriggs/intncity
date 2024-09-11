export default function prToRawData(pr, id, address) {
    const rawData = {
        tree_id: id,
        requestor: [address],
        category: pr.category,
        name: pr.name,
        addr: pr.address
    }

    return JSON.stringify(rawData)
}