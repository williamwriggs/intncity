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

	if !verified {
		return fmt.Errorf("error verifying raw data: data does not match")
	}

	return nil
}
