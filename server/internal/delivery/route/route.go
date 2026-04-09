package route

import (
	"github.com/gofiber/fiber/v3"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/handler"
)

type RouteConfig struct {
	App         *fiber.App
	TaskHandler *handler.TaskHandler
}

func (c *RouteConfig) Setup() {
	taskRoute := TaskRouteConfig{
		App:         c.App,
		TaskHandler: c.TaskHandler,
	}

	taskRoute.Setup()
}
