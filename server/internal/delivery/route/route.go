package route

import (
	"github.com/gofiber/fiber/v3"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/handler"
)

type RouteConfig struct {
	App               *fiber.App
	TaskHandler       *handler.TaskHandler
	TaskStatusHandler *handler.TaskStatusHandler
	RedisStore        fiber.Storage
}

func (c *RouteConfig) Setup() {
	taskRoute := TaskRouteConfig{
		App:         c.App,
		TaskHandler: c.TaskHandler,
		RedisStore:  c.RedisStore,
	}
	taskRoute.Setup()

	taskStatusRoute := TaskStatusRouteConfig{
		App:               c.App,
		TaskStatusHandler: c.TaskStatusHandler,
	}
	taskStatusRoute.Setup()
}
