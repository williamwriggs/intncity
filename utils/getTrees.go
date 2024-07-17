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

	credentials := "../../../../secrets/tree-app-google-service-key.json"
	id := os.Getenv("GOOGLE_SHEETS_ID")
	readRange := "Inventory List!A1:C200"

	sheetsService, err := sheets.NewService(ctx, option.WithCredentialsFile(credentials), option.WithScopes(sheets.SpreadsheetsReadonlyScope))
	if err != nil {
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
