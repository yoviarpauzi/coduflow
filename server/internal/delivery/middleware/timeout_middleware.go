package middleware

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/timeout"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/response"
)

func NewTimeout(t time.Duration) fiber.Handler {
	return timeout.New(func(c fiber.Ctx) error {
		return c.Next()
	}, timeout.Config{
		Timeout: t,
		Errors:  []error{context.DeadlineExceeded},
		OnTimeout: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusRequestTimeout).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "REQUEST_TIMEOUT",
					Message: "request took too long, please try again",
				},
			})
		},
	})
}
