package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/williamwriggs/intncity-treetoken/middleware"
	"github.com/williamwriggs/intncity-treetoken/utils"
)

func UsersHandler(w http.ResponseWriter, r *http.Request) {
	acc, err := middleware.AuthMiddleware(r)
	if err != nil {
		fmt.Println("error using auth middleware:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	account, err := utils.GetAccount(acc)
	if err != nil {
		fmt.Println("error getting account:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if account.Fields.AuthLevel != "admin" {
		fmt.Println("error: user not admin level")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case "GET":
		search := r.URL.Query().Get("search")
		offset := r.URL.Query().Get("offset")

		records, err := utils.GetAccounts(search, offset)
		if err != nil {
			fmt.Println("error getting account records:", err)
			w.WriteHeader(http.StatusInternalServerError)
		}

		fmt.Println(records)

		bytes, err := json.Marshal(records)
		if err != nil {
			fmt.Println("error marshalling account records:", err)
			w.WriteHeader(http.StatusInternalServerError)
		}

		w.Write(bytes)
	}
}
