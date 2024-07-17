package utils

import (
	"fmt"
	"net/http"

	"github.com/rwcarlsen/goexif/exif"
)

func ParseImageLocation(imageURL string) (float64, float64, error) {

	image, err := http.Get(imageURL)
	if err != nil {
		err = fmt.Errorf("error getting image from path: %s", err)
		return 0, 0, err
	}

	metadata, err := exif.Decode(image.Body)
	if err != nil {
		err = fmt.Errorf("error reading image metadata: %s", err)
		return 0, 0, err
	}
	return metadata.LatLong()
}
