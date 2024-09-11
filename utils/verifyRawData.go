package utils

import (
	"encoding/json"
	"fmt"

	"github.com/williamwriggs/intncity-treetoken/structs"
)

func VerifyRawData(request structs.TreeRequest, address string) error {
	rawData := request.RawData
	var unmarshalled structs.TreeRequestUnmarshalledRawData
	err := json.Unmarshal([]byte(rawData), &unmarshalled)
	if err != nil {
		return err
	}
	verified := true &&
		request.TreeId == unmarshalled.TreeId &&
		address == unmarshalled.Requestor[0] &&
		request.TreeCategory == unmarshalled.TreeCategory &&
		request.TreeName == unmarshalled.TreeName &&
		request.Address == unmarshalled.Address

	fmt.Println(request.TreeId, unmarshalled.TreeId)
	fmt.Println(request.Requestor[0], unmarshalled.Requestor[0])
	fmt.Println(request.TreeCategory, unmarshalled.TreeCategory)
	fmt.Println(request.TreeName, unmarshalled.TreeName)
	fmt.Println(request.Address, unmarshalled.Address)

	if !verified {
		fmt.Println("error verifying raw data: data does not match")
		return fmt.Errorf("error verifying raw data: data does not match")
	}

	return nil
}
