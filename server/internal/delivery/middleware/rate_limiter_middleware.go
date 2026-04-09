package middleware

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/response"
)

func NewLimiter(max int, expiration time.Duration, keyPrefix string, store fiber.Storage) fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        max,
		Expiration: expiration,
		Storage:    store,
		KeyGenerator: func(c fiber.Ctx) string {
			return keyPrefix + ":" + c.IP()
		},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "TOO_MANY_REQUESTS",
					Message: "too many requests, please try again later",
				},
			})
		},
	})
}
