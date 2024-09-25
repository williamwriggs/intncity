package utils

import (
	"bytes"
	"fmt"
	"io"
	"net/http"

	"github.com/evanoberholster/imagemeta"
)

func ParseImageLocation(url string) (float64, float64, error) {

	image, err := http.Get(url)
	if err != nil {
		err = fmt.Errorf("error getting image from path: %s", err)
		return 0, 0, err
	}

	body, err := io.ReadAll(image.Body)
	if err != nil {
		err = fmt.Errorf("error reading image data from path: %s", err)
		return 0, 0, err
	}

	reader := bytes.NewReader(body)

	exif, err := imagemeta.Decode(reader)
	if err != nil {
		err = fmt.Errorf("error decoding image data: %s", err)
		return 0, 0, err
	}

	lat := exif.GPS.Latitude()
	long := exif.GPS.Longitude()
	if exif.GPS.Date().Unix() == -62135596800 {
		err = fmt.Errorf("no image location data found")
		return 0, 0, err
	}

	return lat, long, nil
}
