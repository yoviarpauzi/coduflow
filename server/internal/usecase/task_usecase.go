package usecase

import (
	"context"
	"time"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/repository"
	domainRepository "github.com/yoviarpauzi/coduflow/server/internal/domain/repository"
	domainUseCase "github.com/yoviarpauzi/coduflow/server/internal/domain/usecase"
	"go.uber.org/zap"
)

const backgroundTaskRebalanceTimeout = 5 * time.Second

type TaskUseCaseImpl struct {
	TaskRepository repository.TaskRepository
	Log            *zap.Logger
}

func NewTaskUseCase(taskRepository domainRepository.TaskRepository, log *zap.Logger) domainUseCase.TaskUseCase {
	return &TaskUseCaseImpl{
		TaskRepository: taskRepository,
		Log:            log,
	}
}

func (u *TaskUseCaseImpl) Create(ctx context.Context, taskStatusId string, task *entity.Task) (*entity.Task, error) {
	task, err := u.TaskRepository.Create(ctx, taskStatusId, task)

	if err != nil {
		return nil, err
	}

	return task, nil
}

func (u *TaskUseCaseImpl) GetAll(ctx context.Context, search string) ([]entity.Task, error) {
	tasks, err := u.TaskRepository.GetAll(ctx, search)

	if err != nil {
		return nil, err
	}

	return tasks, nil
}

func (u *TaskUseCaseImpl) GetByID(ctx context.Context, id string) (*entity.Task, error) {
	task, err := u.TaskRepository.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return task, nil
}

func (u *TaskUseCaseImpl) UpdateLoggedTime(ctx context.Context, taskId string, loggedTime int) (*entity.Task, error) {
	task, err := u.TaskRepository.UpdateLoggedTime(ctx, taskId, loggedTime)

	if err != nil {
		return nil, err
	}

	return task, nil
}

func (u *TaskUseCaseImpl) UpdateStatus(ctx context.Context, taskId string, taskStatusId string) (*entity.Task, error) {
	task, err := u.TaskRepository.UpdateStatus(ctx, taskId, taskStatusId)

	if err != nil {
		return nil, err
	}

	return task, nil
}

func (u *TaskUseCaseImpl) Update(ctx context.Context, taskId string, taskStatusId string, task *entity.Task) (*entity.Task, error) {
	return u.TaskRepository.Update(ctx, taskId, taskStatusId, task)
}

func (u *TaskUseCaseImpl) UpdatePosition(ctx context.Context, taskId string, position float64, taskStatusId string) (*entity.Task, error) {
	var minTaskGap = 10.0
	existingTask, err := u.TaskRepository.GetByID(ctx, taskId)
	if err != nil {
		return nil, err
	}

	if existingTask.TaskStatusID == taskStatusId && existingTask.Position == position {
		return existingTask, nil
	}

	result, err := u.TaskRepository.UpdatePosition(ctx, taskId, position, taskStatusId)
	if err != nil {
		return nil, err
	}

	// Server-side gap check: trigger rebalance in background if gap is too small.
	pos := result.Position
	baseCtx := context.WithoutCancel(ctx)
	go func(bgCtx context.Context, statusID string, currentPos float64) {
		neighborCtx, cancelNeighbor := context.WithTimeout(bgCtx, backgroundTaskRebalanceTimeout)
		defer cancelNeighbor()

		prev, next, neighborErr := u.TaskRepository.GetNeighborPositions(neighborCtx, statusID, currentPos)
		if neighborErr != nil {
			u.Log.Warn("failed to get neighbor positions for task rebalance check", zap.Error(neighborErr))
			return
		}
		prevGap := currentPos - prev
		nextGap := next - currentPos
		needRebalance := (prev > 0 && prevGap < minTaskGap) || (next > 0 && nextGap < minTaskGap)
		if needRebalance {
			rebalanceCtx, cancelRebalance := context.WithTimeout(bgCtx, backgroundTaskRebalanceTimeout)
			defer cancelRebalance()

			if rebalanceErr := u.TaskRepository.RebalancePositions(rebalanceCtx, statusID); rebalanceErr != nil {
				u.Log.Warn("task rebalance failed", zap.Error(rebalanceErr))
			}
		}
	}(baseCtx, taskStatusId, pos)

	return result, nil
}

func (u *TaskUseCaseImpl) Delete(ctx context.Context, taskId string) error {
	err := u.TaskRepository.Delete(ctx, taskId)

	if err != nil {
		return err
	}

	return nil
}
