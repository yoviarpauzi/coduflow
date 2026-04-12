package repository

import (
	"context"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
)

type TaskRepository interface {
	Create(ctx context.Context, taskStatusID string, task *entity.Task) (*entity.Task, error)
	GetAll(ctx context.Context, search string) ([]entity.Task, error)
	GetByID(ctx context.Context, id string) (*entity.Task, error)
	UpdateStatus(ctx context.Context, id string, taskStatusID string) (*entity.Task, error)
	UpdateLoggedTime(ctx context.Context, id string, loggedTime int) (*entity.Task, error)
	UpdatePosition(ctx context.Context, id string, position float64, taskStatusID string) (*entity.Task, error)
	Update(ctx context.Context, id string, taskStatusID string, task *entity.Task) (*entity.Task, error)
	Delete(ctx context.Context, id string) error
	RebalancePositions(ctx context.Context, taskStatusID string) error
	GetNeighborPositions(ctx context.Context, taskStatusID string, position float64) (prev float64, next float64, err error)
}
