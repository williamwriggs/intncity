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

func GetTree(id string) (*structs.TreeResponseRecord, error) {
	godotenv.Load("../../../../.env")

	baseId := os.Getenv("AIRTABLE_BASE_ID")
	key := os.Getenv("AIRTABLE_KEY")
	tableId := os.Getenv("AIRTABLE_TREE_REQUESTS_TABLE_ID")

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s/%s", baseId, tableId, id)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		err = fmt.Errorf("error creating getTree request: %s", err)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", key))

	query := req.URL.Query()
	req.URL.RawQuery = query.Encode()

	client := http.Client{
		Timeout: time.Second * 10,
	}

	res, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("error sending getTree request: %s", err)
		return nil, err
	}

	record := &structs.TreeResponseRecord{}

	defer res.Body.Close()
	bytes, err := io.ReadAll(res.Body)
	if err != nil {
		err = fmt.Errorf("error reading getTree response body: %s", err)
		return nil, err
	}

	err = json.Unmarshal(bytes, record)
	if err != nil {
		err = fmt.Errorf("error unmarshalling getTree response body: %s", err)
		return nil, err
	}

	fmt.Println(record)

	return record, nil
}
