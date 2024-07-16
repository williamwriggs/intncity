package utils

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/williamwriggs/intncity-treetoken/structs"
)

func PostTreeRequests(address string, requests []structs.TreeRequest) error {
	godotenv.Load("../../../../.env")

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

		request.RequestDate = time.Now()

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

	fmt.Println(body)

	return nil
}
