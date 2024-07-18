package structs

import "time"

//TODO: Update Images Upload to fit json structure:

// {
// 	url: string,
// 	filename: string
// }

// for each image

type TreeRequest struct {
	RequestId    string      `json:"Request ID"`
	Requestor    []string    `json:"Requestor"`
	Status       string      `json:"Status"`
	TreeName     string      `json:"Tree Name"`
	TreeCategory string      `json:"Tree Category"`
	Questions    string      `json:"Questions"`
	Images       []ImageData `json:"Images"`
	Address      string      `json:"Location Address"`
	Lat          float64     `json:"Location Latitude"`
	Long         float64     `json:"Location Longitude"`
}

type ImageData struct {
	Url      string `json:"url"`
	FileName string `json:"filename"`
}

type TreePostObject struct {
	Records []TreePostRecord `json:"records"`
}

type TreePostRecord struct {
	Fields TreeRequest `json:"fields"`
}

type TreeResponse struct {
	RequestId   string    `json:"Request ID"`
	RequestDate time.Time `json:"Request Date"`
	Requestor   []string  `json:"Requestor"`
	Status      string    `json:"Status"`
	Tree        string    `json:"Tree Name"`
	Questions   string    `json:"Questions"`
	Images      []string  `json:"Images"`
	Lat         float64   `json:"Location Latitude"`
	Address     string    `json:"Location Address"`
	Long        float64   `json:"Location Longitude"`
}
