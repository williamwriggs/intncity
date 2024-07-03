package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/williamwriggs/intncity-treetoken/middleware"
	"github.com/williamwriggs/intncity-treetoken/structs"
	"github.com/williamwriggs/intncity-treetoken/utils"
)

func AccountHandler(w http.ResponseWriter, r *http.Request) {
	address, err := middleware.AuthMiddleware(r)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case "POST":
		acc, err := utils.GetAccount(address)
		if err != nil {
			fmt.Println("error in getAccount before post:", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if acc != nil {
			w.WriteHeader(http.StatusConflict)
			return
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Printf("error reading request body: %s\n", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		accountInfo := structs.PostAccount{}

		json.Unmarshal(body, &accountInfo)

		err = utils.PostAccount(address, accountInfo.Email, accountInfo.Name)
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	case "GET":
		account, err := utils.GetAccount(address)
		if err != nil {
			fmt.Println("error getting account:", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if account == nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`"no account found"`))
			return
		}

		body, err := json.Marshal(account)
		if err != nil {
			fmt.Println("error marshalling account:", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Write(body)
	default:
		w.WriteHeader(405)
	}
}