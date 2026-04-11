package usecase

import (
	"context"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
)

type TaskStatusUseCase interface {
	Create(ctx context.Context, taskStatus *entity.TaskStatus) (*entity.TaskStatus, error)
	GetAll(ctx context.Context) ([]entity.TaskStatus, error)
	Update(ctx context.Context, id string, taskStatus *entity.TaskStatus) (*entity.TaskStatus, error)
	UpdatePosition(ctx context.Context, id string, position float64) (*entity.TaskStatus, error)
	Delete(ctx context.Context, id string) error
}
