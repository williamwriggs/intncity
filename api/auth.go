package api

import (
	"fmt"
	"net/http"

	"github.com/williamwriggs/intncity-treetoken/middleware"
)

func GET(w http.ResponseWriter, r *http.Request) {
	acc, err := middleware.AuthMiddleware(r)

	fmt.Println(acc)

	if err != nil {
		fmt.Println("error", err)
		fmt.Fprintf(w, "error")
	}

	fmt.Fprintf(w, "middleware used: %s", acc)
}
