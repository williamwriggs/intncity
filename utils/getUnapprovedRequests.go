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

func GetUnapprovedRequests(search string, offset string) (*structs.TreeQueryResponse, error) {
	godotenv.Load("../../../../.env")

	baseId := os.Getenv("AIRTABLE_BASE_ID")
	key := os.Getenv("AIRTABLE_KEY")
	tableId := os.Getenv("AIRTABLE_TREE_REQUESTS_TABLE_ID")

	filter := `{Approver Signature} = ""`
	if search != "" {
		filter = fmt.Sprintf(`AND(FIND("%s", {Requestor Email}&"") > 0, %s)`, search, filter)
	}

	count := 10

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s", baseId, tableId)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		err = fmt.Errorf("error creating getUnapprovedRequests request: %s", err)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", key))

	query := req.URL.Query()
	if filter != "" {
		query.Add("filterByFormula", filter)
	}
	query.Add(`sort[0][field]`, "Request Date")
	query.Add(`sort[0][direction]`, "desc")
	query.Add("pageSize", fmt.Sprintf("%d", count))
	query.Add("offset", offset)
	req.URL.RawQuery = query.Encode()

	client := http.Client{
		Timeout: time.Second * 10,
	}

	res, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("error sending getUnapprovedRequests request: %s", err)
		return nil, err
	}

	body := &structs.TreeQueryResponse{}

	defer res.Body.Close()
	bytes, err := io.ReadAll(res.Body)
	if err != nil {
		err = fmt.Errorf("error reading getUnapprovedRequests response body: %s", err)
		return nil, err
	}

	err = json.Unmarshal(bytes, body)
	if err != nil {
		err = fmt.Errorf("error unmarshalling getUnapprovedRequests response body: %s", err)
		return nil, err
	}

	return body, nil
}
