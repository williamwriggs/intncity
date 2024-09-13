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

type AccountUpdateRequest struct {
	Id        string `json:"id"`
	AuthLevel string `json:"authLevel"`
}

type AccountUpdate struct {
	Records []AccountUpdateRecord `json:"records"`
}

type AccountUpdateRecord struct {
	Id     string              `json:"id"`
	Fields AccountUpdateFields `json:"fields"`
}

type AccountUpdateFields struct {
	AuthLevel string `json:"auth_level"`
}
