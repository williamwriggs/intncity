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
	address, err := middleware.AuthMiddleware(r)
	if err != nil {
		fmt.Println("error in auth middleware:", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	switch r.Method {
	case "POST":

		requests := []structs.TreeRequest{}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Println("error reading body:", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		err = json.Unmarshal(body, &requests)
		if err != nil {
			fmt.Println("error unmarshalling body:", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		id, err := utils.PostTreeRequests(address, requests)
		if err != nil {
			fmt.Println("error posting tree request:", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(fmt.Sprintf("{\"id\": \"%s\"}", id)))

	case "PUT":
		account, err := utils.GetAccount(address)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if account.Fields.AuthLevel == "none" || account.Fields.AuthLevel == "planter" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		var approverRequest structs.ApproverRequestFields

		body, err := io.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		err = json.Unmarshal(body, approverRequest)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		err = utils.PatchApproverRequest(approverRequest, account)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusAccepted)
		return

	case "GET":

		search := r.URL.Query().Get("search")
		offset := r.URL.Query().Get("offset")

		account, err := utils.GetAccount(address)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if account.Fields.AuthLevel == "none" || account.Fields.AuthLevel == "planter" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		r, err := utils.GetUnapprovedRequests(search, offset)
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		bytes, err := json.Marshal(r)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Write(bytes)
		return

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
}
