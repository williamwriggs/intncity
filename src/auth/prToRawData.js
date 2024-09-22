export default function prToRawData(pr, id, address, gps) {
    const rawData = {
        tree_id: id,
        requestor: [address],
        category: pr.category,
        name: pr.name,
        addr: pr.address,
        lat: gps?.latitude || null,
        long: gps?.longitude || null
    }

    return JSON.stringify(rawData)
}