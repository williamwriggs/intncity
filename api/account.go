package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/williamwriggs/intncity-treetoken/middleware"
	"github.com/williamwriggs/intncity-treetoken/utils"
)

type PostAccount struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

func AccountHandler(w http.ResponseWriter, r *http.Request) {
	address, err := middleware.AuthMiddleware(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
	}

	switch r.Method {
	case "POST":
		body, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Printf("error reading request body: %s\n", err)
		}

		accountInfo := PostAccount{}

		json.Unmarshal(body, &accountInfo)

		name := strings.Split(accountInfo.Name, " ")

		var firstName, lastName string

		if len(name) > 0 {
			firstName = name[0]
		}

		if len(name) > 1 {
			lastName = name[1]
		} else {
			lastName = ""
		}

		err = utils.PostAccount(address, accountInfo.Email, firstName, lastName)
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}

		fmt.Println(address, accountInfo.Email, firstName, lastName)

		w.WriteHeader(http.StatusOK)
	case "GET":

	default:
		w.WriteHeader(405)
	}
}
