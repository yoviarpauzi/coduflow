package middleware

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

const LogContextKey = "log_context"

func AddLogContext(c fiber.Ctx, key string, value any) {
	ctx := c.Locals(LogContextKey)
	if ctx == nil {
		ctx = make(map[string]any)
		c.Locals(LogContextKey, ctx)
	}

	if m, ok := ctx.(map[string]any); ok {
		m[key] = value
	}
}

func NewLogger(log *zap.Logger) fiber.Handler {
	return func(c fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		latency := time.Since(start)

		requestID := c.Get(fiber.HeaderXRequestID)
		if requestID == "" {
			requestID = string(c.Response().Header.Peek(fiber.HeaderXRequestID))
		}
		if requestID == "" {
			if val := c.Locals("requestid"); val != nil {
				requestID = fmt.Sprintf("%v", val)
			}
		}

		fields := []zap.Field{
			zap.String("ip", c.IP()),
			zap.String("method", c.Method()),
			zap.String("url", c.OriginalURL()),
			zap.Int("status", c.Response().StatusCode()),
			zap.String("latency", latency.String()),
			zap.String("request_id", requestID),
		}

		status := c.Response().StatusCode()
		msg := "API Request Success"

		if logCtx := c.Locals(LogContextKey); logCtx != nil {
			if m, ok := logCtx.(map[string]any); ok {
				for k, v := range m {
					if k == "msg" {
						msg = fmt.Sprintf("%v", v)
						continue
					}
					if k == "error" {
						if e, ok := v.(error); ok {
							fields = append(fields, zap.Error(e))
							continue
						}
					}
					fields = append(fields, zap.Any(k, v))
				}
			}
		}

		if err != nil {
			fields = append(fields, zap.Error(err))
			msg = err.Error()
		}

		if status >= 500 {
			log.Error(msg, fields...)
		} else if status >= 400 {
			log.Warn(msg, fields...)
		} else {
			log.Info(msg, fields...)
		}

		return err
	}
}
