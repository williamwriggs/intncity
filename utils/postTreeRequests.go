package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/williamwriggs/intncity-treetoken/structs"
)

func PostTreeRequests(address string, requests []structs.TreeRequest) (string, error) {
	godotenv.Load("../../../../.env")

	acc, err := GetAccount(address)
	if err != nil {
		return "", err
	}

	authLevel := acc.Fields.AuthLevel
	if authLevel == "" {
		authLevel = "none"
	}

	postObject := structs.TreePostObject{}
	id := uuid.New()

	for _, request := range requests {

		var requestor []string

		request.RequestId = id.String()
		request.Requestor = append(requestor, acc.Id)

		if request.ManualLocation != true {
			for _, image := range request.Images {
				lat, long, err := ParseImageLocation(image.Url)
				if err == nil {
					request.Lat = lat
					request.Long = long
					request.ParsedLocation = true
				}
			}
		}

		signed := false
		recovered, err := RecoverSignature(request.RawData, request.Signature)
		if err == nil && recovered == address {
			signed = true
		}

		err = VerifyRawData(request, address)
		if err != nil {
			err = fmt.Errorf("could not verify raw data: ", err)
			return "", err
		}

		var approver []string
		if !signed {
			request.Signature = ""
			request.ApproverSignature = ""
			request.Approver = approver
		}
		if authLevel == "none" {
			request.Status = "Requested"
			request.ApproverSignature = ""
			request.Approver = approver
		} else {
			request.Status = "Verified"
			request.Approver = request.Requestor
			request.ApproverSignature = request.Signature
		}

		treeRecord := structs.TreePostRecord{Fields: request}

		postObject.Records = append(postObject.Records, treeRecord)
	}

	body, err := json.Marshal(postObject)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s",
		os.Getenv("AIRTABLE_BASE_ID"), os.Getenv("AIRTABLE_TREE_REQUESTS_TABLE_ID"))

	b := bytes.NewReader(body)

	req, err := http.NewRequest(http.MethodPost, url, b)

	if err != nil {
		err = fmt.Errorf("error creating post account request: %s", err)
		return "", err
	}

	key := os.Getenv("AIRTABLE_KEY")

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", key))

	client := http.Client{
		Timeout: time.Second * 10,
	}

	res, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("error sending tree request: %s", err)
		return "", err
	}

	if res.StatusCode != 200 {
		err = fmt.Errorf("error sending tree request: POST rejected")
		return "", err
	}

	body, err = io.ReadAll(res.Body)
	if err != nil {
		err = fmt.Errorf("error sending tree request: %s", err)
		return "", err
	}

	return id.String(), nil
}
