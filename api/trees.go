package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/williamwriggs/intncity-treetoken/utils"
)

type Tree struct {
	Name     string `json:"name"`
	Quantity int    `json:"quantity"`
	Category string `json:"category"`
}

func TreesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		rows, err := utils.GetTrees()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		trees := []Tree{}
		currentTrees := make(map[string]bool)

		if len(rows.Values) > 0 {
			currentCategory := ""
			for n, row := range rows.Values {
				if n > 1 {
					cat, ok := row[0].(string)
					if ok {
						if strings.ReplaceAll(cat, " ", "") != "" {
							currentCategory = cat
						}
					}
					if len(row) < 3 {
						continue
					}
					name, ok1 := row[1].(string)
					q, ok2 := row[2].(string)

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
						tree := Tree{Name: name, Quantity: quantity, Category: currentCategory}
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
