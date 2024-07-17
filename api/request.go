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

func RequestHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		address, err := middleware.AuthMiddleware(r)
		if err != nil {
			fmt.Println("error in auth middleware:", err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		requests := []structs.TreeRequest{}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Println("error reading body:", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		fmt.Println("=============BODY===========")
		fmt.Println(string(body))

		err = json.Unmarshal(body, &requests)
		if err != nil {
			fmt.Println("error unmarshalling body:", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		err = utils.PostTreeRequests(address, requests)
		if err != nil {
			fmt.Println("error posting tree request:", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)

	case "GET":
		url := "https://www.ottergeospatial.info/wp-content/uploads/2019/08/IMG_0022_01-816w.jpg"
		lat, long, err := utils.ParseImageLocation(url)
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		fmt.Println(lat, long)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
