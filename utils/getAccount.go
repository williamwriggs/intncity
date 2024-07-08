package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/williamwriggs/intncity-treetoken/structs"
)

func GetAccount(address string) (*structs.AccountRecord, error) {
	godotenv.Load("../../../../.env")

	baseId := os.Getenv("AIRTABLE_BASE_ID")
	key := os.Getenv("AIRTABLE_KEY")
	tableId := os.Getenv("AIRTABLE_AUTH_TABLE_ID")

	filter := fmt.Sprintf(`address = "%s"`, address)

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s", baseId, tableId)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		err = fmt.Errorf("error creating getAccount request: %s", err)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", key))

	query := req.URL.Query()
	query.Add("filterByFormula", filter)
	req.URL.RawQuery = query.Encode()

	client := http.Client{
		Timeout: time.Second * 10,
	}

	res, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("error sending getAccount request: %s", err)
		return nil, err
	}

	records := &structs.AccountsResponse{}

	defer res.Body.Close()
	bytes, err := io.ReadAll(res.Body)
	if err != nil {
		err = fmt.Errorf("error reading getAccount response body: %s", err)
		return nil, err
	}

	err = json.Unmarshal(bytes, records)
	if err != nil {
		err = fmt.Errorf("error unmarshalling getAccount response body: %s", err)
		return nil, err
	}

	var record *structs.AccountRecord

	switch len(records.Records) {
	case 0:
		record = nil
	case 1:
		record = &records.Records[0]
	default:
		for n := range records.Records {
			if records.Records[n].Fields.AuthLevel != "none" {
				record = &records.Records[n]
			}
		}
		if record == nil {
			record = &records.Records[0]
		}
	}

	return record, nil
}
