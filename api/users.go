package api

import (
	"encoding/json"
	"net/http"

	"github.com/williamwriggs/intncity-treetoken/middleware"
	"github.com/williamwriggs/intncity-treetoken/utils"
)

func UsersHandler(w http.ResponseWriter, r *http.Request) {
	acc, err := middleware.AuthMiddleware(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	account, err := utils.GetAccount(acc)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if account.Fields.AuthLevel != "admin" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case "GET":
		search := r.URL.Query().Get("search")
		offset := r.URL.Query().Get("offset")

		records, err := utils.GetAccounts(search, offset)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}

		bytes, err := json.Marshal(records)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}

		w.Write(bytes)
	}
}
