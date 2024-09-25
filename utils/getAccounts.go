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

func GetAccounts(search string, offset string) (*structs.AccountsResponse, error) {
	godotenv.Load("../../../../.env")

	baseId := os.Getenv("AIRTABLE_BASE_ID")
	key := os.Getenv("AIRTABLE_KEY")
	tableId := os.Getenv("AIRTABLE_AUTH_TABLE_ID")

	filter := `FIND("", {email}) > 0`
	if search != "" {
		filter = fmt.Sprintf(`AND(FIND("%s", {email}) > 0, %s)`, search, filter)
	}

	count := 10

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s", baseId, tableId)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		err = fmt.Errorf("error creating getAccount request: %s", err)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", key))

	query := req.URL.Query()
	if filter != "" {
		query.Add("filterByFormula", filter)
	}
	// query.Add("sort[0][field]", "Created At")
	// query.Add("sort[0][direction]", "asc")
	query.Add("pageSize", fmt.Sprintf("%d", count))
	query.Add("offset", offset)
	req.URL.RawQuery = query.Encode()

	client := http.Client{
		Timeout: time.Second * 10,
	}

	res, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("error sending getAccounts request: %s", err)
		return nil, err
	}

	body := &structs.AccountsResponse{}

	defer res.Body.Close()
	bytes, err := io.ReadAll(res.Body)
	if err != nil {
		err = fmt.Errorf("error reading getAccounts response body: %s", err)
		return nil, err
	}

	err = json.Unmarshal(bytes, body)
	if err != nil {
		err = fmt.Errorf("error unmarshalling getAccounts response body: %s", err)
		return nil, err
	}

	return body, nil
}
