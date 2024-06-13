package api

import (
	"fmt"
	"net/http"

	"github.com/williamwriggs/intncity-treetoken/middleware"
)

func GET(w http.ResponseWriter, r *http.Request) {
	str := middleware.AuthMiddleware()
	fmt.Fprintf(w, "middleware used: %s", str)
}
