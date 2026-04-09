package usecase

import (
	"context"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
)

type TaskUseCase interface {
	Create(ctx context.Context, task *entity.Task) (*entity.Task, error)
	UpdateStatus(ctx context.Context, taskId string, status *entity.TaskStatus) (*entity.Task, error)
	Delete(ctx context.Context, id string) error
}
