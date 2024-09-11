package utils

import (
	"encoding/hex"
	"strconv"

	"github.com/umbracle/ethgo"
	"github.com/umbracle/ethgo/wallet"

	"strings"
)

func RecoverSignature(raw string, sig string) (string, error) {

	prefixed := []byte("\x19Ethereum Signed Message:\n" + strconv.Itoa(len(raw)) + raw)

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

	return address, nil
}
