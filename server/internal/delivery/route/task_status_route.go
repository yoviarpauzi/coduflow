package route

import (
	"github.com/gofiber/fiber/v3"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/handler"
)

type TaskStatusRouteConfig struct {
	App               *fiber.App
	TaskStatusHandler *handler.TaskStatusHandler
}

func (c *TaskStatusRouteConfig) Setup() {
	taskStatusRoute := c.App.Group("/api/v1/task-status")

	taskStatusRoute.Get("/", c.TaskStatusHandler.GetAll)
	taskStatusRoute.Post("/", c.TaskStatusHandler.Create)
	taskStatusRoute.Patch("/:id/position", c.TaskStatusHandler.UpdatePosition)
	taskStatusRoute.Put("/:id", c.TaskStatusHandler.Update)
	taskStatusRoute.Delete("/:id", c.TaskStatusHandler.Delete)
}
