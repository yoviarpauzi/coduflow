package config

import (
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/gofiber/fiber/v3/middleware/requestid"
	"github.com/spf13/viper"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/middleware"
	"go.uber.org/zap"
)

func NewFiber(config *viper.Viper, log *zap.Logger) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName: config.GetString("server.name"),
	})

	app.Use(requestid.New())
	app.Use(recover.New())
	app.Use(middleware.NewLogger(log))
	app.Use(cors.New())

	return app
}
