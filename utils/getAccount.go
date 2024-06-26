package utils

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func GetAccount() {
	godotenv.Load("../../../../.env.local")

	baseId := os.Getenv("AIRTABLE_BASE_ID")
	key := os.Getenv("AIRTABLE_KEY")
	tableId := os.Getenv("AIRTABLE_AUTH_TABLE_ID")

	fmt.Println("base id: ", baseId)
	fmt.Println("table id: ", tableId)
	fmt.Println("key: ", key)
}
