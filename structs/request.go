package structs

import "time"

//TODO: Update Images Upload to fit json structure:

// {
// 	url: string,
// 	filename: string
// }

// for each image

type TreeRequest struct {
	RequestId         string      `json:"Request ID"`
	TreeId            string      `json:"Tree ID"`
	Requestor         []string    `json:"Requestor"`
	Status            string      `json:"Status"`
	TreeName          string      `json:"Tree Name"`
	TreeCategory      string      `json:"Tree Category"`
	Questions         string      `json:"Questions"`
	Images            []ImageData `json:"Images"`
	Address           string      `json:"Location Address"`
	Lat               float64     `json:"Location Latitude"`
	Long              float64     `json:"Location Longitude"`
	RawData           string      `json:"Raw Data"`
	Signature         string      `json:"Signature"`
	Approver          []string    `json:"Approver"`
	ApproverSignature string      `json:"Approver Signature"`
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

type TreeRecord struct {
	Id          string     `json:"id"`
	CreatedTime time.Time  `json:"createdTime"`
	Fields      TreeFields `json:"fields"`
}

type TreeFields struct {
	RequestId   string    `json:"Request ID"`
	TreeId      string    `json:"Tree ID"`
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

type TreeResponseRecord struct {
	Id          string             `json:"id"`
	CreatedTime string             `json:"createdTime"`
	Fields      TreeResponseFields `json:"fields"`
}

type TreeResponseFields struct {
	RequestId   string      `json:"Request ID"`
	TreeId      string      `json:"Tree ID"`
	RequestDate string      `json:"Request Date"`
	Requestor   []string    `json:"Requestor"`
	Status      string      `json:"Status"`
	Tree        string      `json:"Tree Name"`
	Questions   string      `json:"Questions"`
	Images      []TreeImage `json:"Images"`
	Lat         float64     `json:"Location Latitude"`
	Address     string      `json:"Location Address"`
	Long        float64     `json:"Location Longitude"`
}

type TreeImage struct {
	Id   string `json:"id"`
	Url  string `json:"url"`
	Name string `json:"filename"`
	Type string `json:"type"`
}

type TreeQueryResponse struct {
	Records []TreeResponseRecord `json:"records"`
	Offset  string               `json:"offset"`
}

type ApproverRequestFields struct {
	TreeId    string   `json:"Tree ID"`
	Approver  []string `json:"Approver"`
	Status    string   `json:"Status"`
	Signature string   `json:"Approver Signature"`
}

type ApproverRequestRecord struct {
	Id     string                `json:"id"`
	Fields ApproverRequestFields `json:"fields"`
}

type ApproverRequests struct {
	Records []ApproverRequestRecord `json:"records"`
}

type TreeRequestUnmarshalledRawData struct {
	TreeId       string   `json:"tree_id"`
	Requestor    []string `json:"requestor"`
	TreeCategory string   `json:"category"`
	TreeName     string   `json:"name"`
	Address      string   `json:"addr"`
}
