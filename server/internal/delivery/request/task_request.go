package request

import (
	"time"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
)

type CreateTaskRequest struct {
	Name          string               `json:"name" validate:"required"`
	Status        entity.TaskStatus    `json:"status" validate:"required,oneof=TODO DOING COMPLETE"`
	Priority      *entity.TaskPriority `json:"priority" validate:"omitempty,oneof=1 2 3 4 5"`
	Position      float64              `json:"position" validate:"required"`
	EstimatedTime *int                 `json:"estimated_time" validate:"omitempty,gte=0"`
	LoggedTime    *int                 `json:"logged_time" validate:"omitempty,gte=0"`
	DueDate       *time.Time           `json:"due_date" validate:"omitempty"`
}

type UpdateStatusTaskRequest struct {
	Status entity.TaskStatus `json:"status" validate:"required,oneof=TODO DOING COMPLETE"`
}
