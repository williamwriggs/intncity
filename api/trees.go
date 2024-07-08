package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/williamwriggs/intncity-treetoken/utils"
)

type Tree struct {
	Name     string `json:"name"`
	Quantity int    `json:"quantity"`
}

func TreesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		rows, err := utils.GetTrees()
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		trees := []Tree{}
		currentTrees := make(map[string]bool)

		if len(rows.Values) > 0 {
			for _, row := range rows.Values {
				if len(row) == 2 {
					name, ok1 := row[0].(string)
					q, ok2 := row[1].(string)

					var quantity int

					if ok1 {
						ok1 = !currentTrees[strings.ToLower(name)]
					}

					if ok2 {
						quantity, err = strconv.Atoi(q)
						if err != nil {
							ok2 = false
						}
					}

					if ok1 && ok2 && quantity != 0 {
						tree := Tree{Name: name, Quantity: quantity}
						trees = append(trees, tree)
						currentTrees[strings.ToLower(name)] = true
					}
				}
			}
		}

		bytes, err := json.Marshal(trees)
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
