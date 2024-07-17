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

func PostTreeRequests(address string, requests []structs.TreeRequest) error {
	godotenv.Load("../../../../.env")

	fmt.Println("=======REQUESTS========")
	fmt.Println(len(requests))
	fmt.Println(requests[len(requests)-1])

	acc, err := GetAccount(address)
	if err != nil {
		fmt.Println("error getting user account:", err)
		return err
	}

	authLevel := acc.Fields.AuthLevel
	if authLevel == "" {
		authLevel = "none"
	}

	for n, request := range requests {

		if authLevel == "none" {
			request.Status = "Requested"
		} else {
			request.Status = "Verified"
		}

		id := uuid.New()

		request.RequestId = id.String()

		request.Requestor = address

		for _, image := range request.Images {
			lat, long, err := ParseImageLocation(image)
			if err != nil {
				fmt.Println("error parsing image location:", err)
			} else {
				request.Lat = lat
				request.Long = long
			}
		}

		requests[n] = request
	}

	body, err := json.Marshal(requests)
	if err != nil {
		return err
	}

	fmt.Println(string(body))

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s",
		os.Getenv("AIRTABLE_BASE_ID"), os.Getenv("AIRTABLE_TREE_REQUESTS_TABLE_ID"))

	b := bytes.NewReader(body)

	req, err := http.NewRequest(http.MethodPost, url, b)

	if err != nil {
		err = fmt.Errorf("error creating post account request: %s", err)
		return err
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
		return err
	}

	_, err = io.ReadAll(res.Body)
	if err != nil {
		err = fmt.Errorf("error sending tree request: %s", err)
		return err
	}

	return nil
}
