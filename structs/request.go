package structs

import "time"

type TreeRequest struct {
	RequestId    string   `json:"Request ID"`
	Requestor    string   `json:"Requestor"`
	Status       string   `json:"Status"`
	TreeName     string   `json:"Requested Tree"`
	TreeCategory string   `json:"Tree Category"`
	Questions    string   `json:"Questions"`
	Images       []string `json:"Images"`
	Address      string   `json:"Location Address"`
	Lat          float64  `json:"Location Latitude"`
	Long         float64  `json:"Location Longitude"`
}

type TreeResponse struct {
	RequestId   string    `json:"Request ID"`
	RequestDate time.Time `json:"Request Date"`
	Requestor   string    `json:"Requestor"`
	Status      string    `json:"Status"`
	Tree        string    `json:"Requested Tree"`
	Questions   string    `json:"Questions"`
	Images      []string  `json:"Images"`
	Lat         float64   `json:"Location Latitude"`
	Address     string    `json:"Location Address"`
	Long        float64   `json:"Location Longitude"`
}
