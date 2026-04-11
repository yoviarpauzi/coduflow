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

	task.Get("/", c.TaskHandler.GetAll)
	task.Post("/", c.TaskHandler.Create)
	task.Patch("/:id/position", c.TaskHandler.UpdatePosition)
	task.Patch("/:id/logged-time", c.TaskHandler.UpdateLoggedTime)
	task.Patch("/:id/status", c.TaskHandler.UpdateStatus)
	task.Put("/:id", c.TaskHandler.Update)
	task.Delete("/:id", c.TaskHandler.Delete)
}
