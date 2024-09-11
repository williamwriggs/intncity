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

func PatchApproverRequest(request structs.ApproverRequestFields, account *structs.AccountRecord) error {
	godotenv.Load("../../../../.env")

	tree, err := GetTree(request.TreeId)
	if err != nil {
		err = fmt.Errorf("error getting tree record at id %s: %s", request.TreeId, err)
		return err
	}

	if tree.Fields.Status == "Verified" {
		err = fmt.Errorf("error putting approver request: tree already verified")
		return err
	}

	recovered, err := RecoverSignature(tree.Fields.Status, request.Signature)
	if err != nil {
		err = fmt.Errorf("error recovering signature: ", err)
		return err
	}
	if recovered != account.Fields.Address {
		err = fmt.Errorf("error validating signature: %s does not match %s", recovered, account.Fields.Address)
	}

	var approver []string

	request.Approver = append(approver, recovered)
	request.Status = "Verified"

	var formattedRequest structs.ApproverRequests
	var formattedRecord structs.ApproverRequestRecord

	formattedRecord.Id = tree.Id
	formattedRecord.Fields = request
	formattedRequest.Records[0] = formattedRecord

	body, err := json.Marshal(request)
	if err != nil {
		err = fmt.Errorf("error marshalling approver request: ", err)
		return err
	}

	fmt.Println(string(body))

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s",
		os.Getenv("AIRTABLE_BASE_ID"), os.Getenv("AIRTABLE_TREE_REQUESTS_TABLE_ID"))

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
		fmt.Println(err)
		err = fmt.Errorf("error sending patch request: %s", err)
		return err
	}

	return nil
}
