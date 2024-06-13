package middleware

import (
	"fmt"
)

type UserInfo struct {
	authLevel string
	userId    string
}

func AuthMiddleware() string {
	return fmt.Sprintln("middleware")
}
