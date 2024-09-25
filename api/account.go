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
	if err != nil || address == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case "POST":
		acc, err := utils.GetAccount(address)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if acc != nil {
			w.WriteHeader(http.StatusConflict)
			return
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		accountInfo := structs.PostAccount{}

		err = json.Unmarshal(body, &accountInfo)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if accountInfo.Name == "" || accountInfo.Email == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		err = utils.PostAccount(address, accountInfo.Email, accountInfo.Name)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	case "GET":
		account, err := utils.GetAccount(address)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		fmt.Println(account)

		if account == nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`"no account found"`))
			return
		}

		body, err := json.Marshal(account)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Write(body)

	case "PATCH":
		account, err := utils.GetAccount(address)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if account.Fields.AuthLevel != "admin" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		var updateRequest structs.AccountUpdateRequest

		body, err := io.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		err = json.Unmarshal(body, &updateRequest)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		err = utils.PatchUser(updateRequest, account)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusAccepted)
		return
	default:
		w.WriteHeader(405)
	}
}
