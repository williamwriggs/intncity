package utils

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func PostAccount(address, email, firstName, lastName string) error {
	godotenv.Load("../../../../.env.local")

	if lastName == "" {
		lastName = "not given"
	}

	body := bytes.NewReader([]byte(fmt.Sprintf(`{
		"records": [
			{
				"fields": {
					"address": "%s",
					"email": "%s",
					"first_name": "%s",
					"last_name": "%s"
				}
			}
		]
	}`, address, email, firstName, lastName)))

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s",
		os.Getenv("AIRTABLE_BASE_ID"), os.Getenv("AIRTABLE_AUTH_TABLE_ID"))

	fmt.Println(url)

	req, err := http.NewRequest(http.MethodPost, url, body)

	if err != nil {
		err = fmt.Errorf("error creating post account request: %s", err)
		return err
	}

	key := os.Getenv("AIRTABLE_KEY")

	fmt.Println("key: ", key)

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", key))

	client := http.Client{
		Timeout: time.Second * 10,
	}

	fmt.Println(req.Header)

	res, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("error sending post account request: %s", err)
		return err
	}

	resBody, err := io.ReadAll(res.Body)
	if err != nil {
		err = fmt.Errorf("error sending post account request: %s", err)
		return err
	}
	fmt.Println(res.Status, string(resBody))

	return nil
}
