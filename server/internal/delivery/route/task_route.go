package route

import (
	"github.com/gofiber/fiber/v3"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/handler"
)

type TaskRouteConfig struct {
	App         *fiber.App
	TaskHandler *handler.TaskHandler
}

func (c *TaskRouteConfig) Setup() {
	task := c.App.Group("/api/v1/task")

	task.Post("/", c.TaskHandler.Create)
	task.Patch("/:id/status", c.TaskHandler.UpdateStatus)
	task.Delete("/:id", c.TaskHandler.Delete)
}
