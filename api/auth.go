package api

import (
	"fmt"
	"net/http"

	"github.com/williamwriggs/intncity-treetoken/middleware"
	"github.com/williamwriggs/intncity-treetoken/utils"
)

func AuthHandler(w http.ResponseWriter, r *http.Request) {
	acc, err := middleware.AuthMiddleware(r)

	utils.GetAccount()

	if err != nil {
		fmt.Println("error", err)
		fmt.Fprintf(w, "error")
	}

	fmt.Fprintf(w, "middleware used: %s", acc)
}
