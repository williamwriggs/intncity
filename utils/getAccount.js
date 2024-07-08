export default async function getAccount(address) {
    const baseId = process.env.AIRTABLE_BASE_ID
    const key = process.env.AIRTABLE_KEY
    const tableId = process.env.AIRTABLE_AUTH_TABLE_ID
    const filter = 'address = "' + address + '"'

	const url = "https://api.airtable.com/v0/" + baseId + "/" + tableId
    let error

    const res = await fetch(url + "?" + new URLSearchParams({
        "filterByFormula": filter
    }), {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + key
        }
    }).catch((err) => {
        error = err
    })

    if (error != undefined) {
        console.error(error)
        throw new Error(error)
    }

    const account = await res.json().catch((err) => {error = err})
    if (error != undefined) {
        console.error(error)
        throw new Error(error)
    }


    return account.records[0] || null

}