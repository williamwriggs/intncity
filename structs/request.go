package structs

import "time"

type TreeRequest struct {
	RequestId   string    `json:"Request ID"`
	RequestDate time.Time `json:"Request Date"`
	Requestor   string    `json:"Requestor"`
	Status      string    `json:"Status"`
	Tree        string    `json:"Requested Tree"`
	Questions   string    `json:"Questions"`
	Images      []string  `json:"Images"`
	Lat         float64   `json:"Location Latitude"`
	Long        float64   `json:"Location Longitude"`
}
