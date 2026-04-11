package request

import (
	"time"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
)

type CreateTaskRequest struct {
	Name          string               `json:"name" validate:"required"`
	Description   *string              `json:"description" validate:"omitempty"`
	TaskStatusID  string               `json:"task_status_id" validate:"required"`
	Priority      *entity.TaskPriority `json:"priority" validate:"omitempty,oneof=1 2 3 4 5"`
	Position      float64              `json:"position" validate:"required"`
	EstimatedTime *int                 `json:"estimated_time" validate:"omitempty,gte=0"`
	LoggedTime    *int                 `json:"logged_time" validate:"omitempty,gte=0"`
	DueDate       *time.Time           `json:"due_date" validate:"omitempty"`
}

type UpdateStatusTaskRequest struct {
	TaskStatusID string `json:"task_status_id" validate:"required"`
}

type UpdateLoggedTimeTaskRequest struct {
	LoggedTime int `json:"logged_time" validate:"required,gte=0"`
}

type UpdateTaskRequest struct {
	Name          *string              `json:"name" validate:"omitempty"`
	Description   *string              `json:"description" validate:"omitempty"`
	TaskStatusID  *string              `json:"task_status_id" validate:"omitempty"`
	Priority      *entity.TaskPriority `json:"priority" validate:"omitempty,oneof=1 2 3 4 5"`
	Position      *float64             `json:"position" validate:"omitempty"`
	EstimatedTime *int                 `json:"estimated_time" validate:"omitempty,gte=0"`
	LoggedTime    *int                 `json:"logged_time" validate:"omitempty,gte=0"`
	DueDate       *time.Time           `json:"due_date" validate:"omitempty"`
}

// UpdateTaskPositionRequest is used by PATCH /task/:id/position.
type UpdateTaskPositionRequest struct {
	Position     float64 `json:"position" validate:"required"`
	TaskStatusID string  `json:"task_status_id" validate:"required"`
}
