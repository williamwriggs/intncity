package structs

type PostAccount struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

type AccountFields struct {
	Address   string `json:"address"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AuthLevel string `json:"auth_level"`
}

type AccountRecord struct {
	Id          string        `json:"id"`
	CreatedTime string        `json:"createdTime"`
	Fields      AccountFields `json:"fields"`
}

type AccountsResponse struct {
	Records []AccountRecord `json:"records"`
	Offset  string          `json:"offset"`
}
