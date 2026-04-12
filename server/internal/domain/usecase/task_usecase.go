package usecase

import (
	"context"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
)

type TaskUseCase interface {
	Create(ctx context.Context, taskStatusId string, task *entity.Task) (*entity.Task, error)
	GetAll(ctx context.Context, search string) ([]entity.Task, error)
	GetByID(ctx context.Context, id string) (*entity.Task, error)
	UpdateStatus(ctx context.Context, taskId string, taskStatusID string) (*entity.Task, error)
	UpdateLoggedTime(ctx context.Context, taskId string, loggedTime int) (*entity.Task, error)
	UpdatePosition(ctx context.Context, taskId string, position float64, taskStatusID string) (*entity.Task, error)
	Update(ctx context.Context, taskId string, taskStatusId string, task *entity.Task) (*entity.Task, error)
	Delete(ctx context.Context, id string) error
}
