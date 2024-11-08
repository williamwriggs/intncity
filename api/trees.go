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

var baseTreeList = [...]string{
	"African fern pine",
	"Aleppo oak",
	"atlas cedar",
	"Brisbane box",
	"bronze loquat",
	"cajeput tree",
	"California buckeye",
	"Canary Island pine",
	"Catalina cherry",
	"chestnut leaf oak",
	"Chinese pistache",
	"Chisos red oak",
	"coast live oak",
	"compact strawberry tree",
	"Compton oak",
	"cork oak",
	"crape myrtle, Chocta",
	"crape myrtle, Muskogee",
	"crape myrtle, Natchez",
	"crape myrtle, Tuscaror",
	"encino tezahuatl",
	"Engelmann oak",
	"escarpment oak",
	"evergreen maple",
	"fastigate blue atlas cedar",
	"flamegold",
	"ghost gum",
	"gold medallion tree",
	"Hollywood juniper",
	"island oak",
	"jelecote pine",
	"king palm",
	"lemon-scented gum",
	"macadamia",
	"Macedonian oak",
	"marina madrone",
	"Mexican blue oak",
	"Mexican red oak",
	"Mount Lemmon super gambel oak",
	"netleaf oak",
	"New Zealand Christmas tree/Pohutukawa",
	"olive, Swan Hill (single stem",
	"pink trumpet tree",
	"Pyrenees oak",
	"red flowering gum",
	"Red Push pistache",
	"Roberts California sycamore",
	"rusty leaf fig",
	"Sartor's oak",
	"Shangtung maple",
	"silver dollar gum",
	"silverleaf oak",
	"soapbark tree",
	"southern live oak",
	"swamp malee",
	"sweet hakea",
	"Sydney red gum",
	"Torrey Pine",
	"Torrey's hybrid oak",
	"toyon, Davis Gold",
	"trident maple",
	"water gum",
	"weeping fig",
	"WestMex red oak",
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
		for _, tree := range baseTreeList {
			trees = append(trees, Tree{Name: tree, Quantity: 10, Category: "Approved Trees"})
			currentTrees[strings.ToLower(tree)] = true
		}

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
