package utils

import (
	"context"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

func GetTrees() (*sheets.ValueRange, error) {
	godotenv.Load("../../../../.env")

	ctx := context.Background()

	id := os.Getenv("GOOGLE_SHEETS_ID")

	sheet_key_type := os.Getenv("GOOGLE_SERVICE_KEY_TYPE")
	sheet_key_id := os.Getenv("GOOGLE_SERVICE_KEY_ID")
	sheet_key_key_id := os.Getenv("GOOGLE_SERVICE_KEY_KEY_ID")
	sheet_key_key := os.Getenv("GOOGLE_SERVICE_KEY_KEY")
	sheet_email := os.Getenv("GOOGLE_SERVICE_KEY_EMAIL")
	sheet_client_id := os.Getenv("GOOGLE_SERVICE_KEY_CLIENT_ID")
	sheet_auth_uri := os.Getenv("GOOGLE_SERVICE_KEY_AUTH_URI")
	sheet_token_uri := os.Getenv("GOOGLE_SERVICE_KEY_TOKEN_URI")
	sheet_provider_cert := os.Getenv("GOOGLE_SERVICE_KEY_AUTH_PROVIDER_CERT")
	sheet_client_cert := os.Getenv("GOOGLE_SERVICE_KEY_CLIENT_CERT")
	sheet_universe_domain := os.Getenv("GOOGLE_SERVICE_KEY_UNIVERSE_DOMAIN")
	readRange := "Inventory List!A1:C200"

	credentials := fmt.Sprintf(`{
  "type": "%s",
  "project_id": "%s",
  "private_key_id": "%s",
  "private_key": %q,
  "client_email": "%s",
  "client_id": "%s",
  "auth_uri": "%s",
  "token_uri": "%s",
  "auth_provider_x509_cert_url": "%s",
  "client_x509_cert_url": "%s",
  "universe_domain": "%s"
}`, sheet_key_type, sheet_key_id, sheet_key_key_id, sheet_key_key, sheet_email, sheet_client_id, sheet_auth_uri, sheet_token_uri, sheet_provider_cert, sheet_client_cert, sheet_universe_domain)

	sheetsService, err := sheets.NewService(ctx, option.WithCredentialsJSON([]byte(credentials)), option.WithScopes(sheets.SpreadsheetsReadonlyScope))
	if err != nil {
		fmt.Println(err)
		err = fmt.Errorf("error creating sheets service: %s", err)
		return nil, err
	}

	trees, err := sheetsService.Spreadsheets.Values.Get(id, readRange).Do()
	if err != nil {
		err = fmt.Errorf("error getting sheet values: %s", err)
		return nil, err
	}

	return trees, nil
}
