package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/williamwriggs/intncity-treetoken/structs"
)

func PatchUser(request structs.AccountUpdateRequest, account *structs.AccountRecord) error {
	godotenv.Load("../../../../.env")

	var formattedRequest structs.AccountUpdate
	var formattedRecord structs.AccountUpdateRecord

	formattedRecord.Id = request.Id
	formattedRecord.Fields.AuthLevel = request.AuthLevel
	formattedRequest.Records = append(formattedRequest.Records, formattedRecord)

	body, err := json.Marshal(formattedRequest)
	if err != nil {
		err = fmt.Errorf("error marshalling approver request: ", err)
		return err
	}

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s",
		os.Getenv("AIRTABLE_BASE_ID"), os.Getenv("AIRTABLE_AUTH_TABLE_ID"))

	b := bytes.NewReader(body)

	req, err := http.NewRequest(http.MethodPatch, url, b)

	if err != nil {
		err = fmt.Errorf("error creating patch request: %s", err)
		return err
	}

	key := os.Getenv("AIRTABLE_KEY")

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", key))

	client := http.Client{
		Timeout: time.Second * 10,
	}

	_, err = client.Do(req)
	if err != nil {
		err = fmt.Errorf("error sending patch request: %s", err)
		return err
	}

	return nil
}
