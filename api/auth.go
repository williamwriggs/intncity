package api

import (
	"fmt"
	"net/http"

	"github.com/williamwriggs/intncity-treetoken/middleware"
	"github.com/williamwriggs/intncity-treetoken/utils"
)

func AuthHandler(w http.ResponseWriter, r *http.Request) {
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

	if account == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.Write([]byte(fmt.Sprintf(`"%s"`, account.Fields.AuthLevel)))
}
