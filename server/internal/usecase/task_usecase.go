package usecase

import (
	"context"
	"log"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/repository"
	domainRepository "github.com/yoviarpauzi/coduflow/server/internal/domain/repository"
	domainUseCase "github.com/yoviarpauzi/coduflow/server/internal/domain/usecase"
)

const minTaskGap = 10.0

type TaskUseCaseImpl struct {
	TaskRepository repository.TaskRepository
}

func NewTaskUseCase(taskRepository domainRepository.TaskRepository) domainUseCase.TaskUseCase {
	return &TaskUseCaseImpl{
		TaskRepository: taskRepository,
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
	result, err := u.TaskRepository.UpdatePosition(ctx, taskId, position, taskStatusId)
	if err != nil {
		return nil, err
	}

	// Server-side gap check: trigger rebalance in background if gap is too small.
	pos := result.Position
	go func() {
		prev, next, neighborErr := u.TaskRepository.GetNeighborPositions(context.Background(), taskStatusId, pos)
		if neighborErr != nil {
			log.Printf("warn: failed to get neighbor positions for task rebalance check: %v", neighborErr)
			return
		}
		prevGap := pos - prev
		nextGap := next - pos
		needRebalance := (prev > 0 && prevGap < minTaskGap) || (next > 0 && nextGap < minTaskGap)
		if needRebalance {
			if rebalanceErr := u.TaskRepository.RebalancePositions(context.Background(), taskStatusId); rebalanceErr != nil {
				log.Printf("warn: task rebalance failed: %v", rebalanceErr)
			}
		}
	}()

	return result, nil
}

func (u *TaskUseCaseImpl) Delete(ctx context.Context, taskId string) error {
	err := u.TaskRepository.Delete(ctx, taskId)

	if err != nil {
		return err
	}

	return nil
}
