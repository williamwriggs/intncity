package middleware

import (
	"bytes"
	"encoding/hex"
	"io"
	"strconv"

	"github.com/umbracle/ethgo"
	"github.com/umbracle/ethgo/wallet"

	"errors"
	"fmt"
	"net/http"
	"strings"
)

type UserInfo struct {
	authLevel string
	userId    string
}

func AuthMiddleware(r *http.Request) (string, error) {
	h, ok := r.Header["Authorization"]
	if ok == false {
		err := errors.New("err: no authorization header")
		return "", err
	}

	token := h[0]

	token, found := strings.CutPrefix(token, "Bearer ")
	if found == false {
		err := errors.New("err: incorrect authorization header format, must be prefixed by 'Bearer '")
		return "", err
	}

	auth := strings.Split(token, ".")
	if len(auth) != 3 {
		err := errors.New("err: incorrect authorziation header format")
		return "", err
	}

	acc := auth[0]
	time := auth[1]
	sig := auth[2]

	var signer string

	method := r.Method
	if method == "" {
		method = "GET"
	}

	switch method {
	case "GET":

		queryString := r.URL.RawQuery
		signer = fmt.Sprintf("?%s%s", queryString, time)

	default:

		body, err := io.ReadAll(r.Body)

		if err != nil {
			return "", err
		}

		r.Body.Close()
		r.Body = io.NopCloser(bytes.NewBuffer(body))

		signer = fmt.Sprintf("%s%s", body, time)
	}

	prefixed := []byte("\x19Ethereum Signed Message:\n" + strconv.Itoa(len(signer)) + signer)

	hash := ethgo.Keccak256(prefixed)

	unPrefixedSig, found := strings.CutPrefix(sig, "0x")
	if !found {
		unPrefixedSig = sig
	}

	sigBytes, err := hex.DecodeString(unPrefixedSig)
	if err != nil {
		return "", err
	}

	if sigBytes[64] >= 27 {
		sigBytes[64] -= 27
	}

	rec, err := wallet.Ecrecover(hash, sigBytes)

	if err != nil {
		return "", err
	}

	address := rec.String()

	if address != acc {
		err = errors.New("error: recovered address does not match given address")
		return "", err
	}

	return address, nil
}
