package usecase

import (
	"context"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/repository"
	domainRepository "github.com/yoviarpauzi/coduflow/server/internal/domain/repository"
	domainUseCase "github.com/yoviarpauzi/coduflow/server/internal/domain/usecase"
)

type TaskUseCaseImpl struct {
	TaskRepository repository.TaskRepository
}

func NewTaskUseCase(taskRepository domainRepository.TaskRepository) domainUseCase.TaskUseCase {
	return &TaskUseCaseImpl{
		TaskRepository: taskRepository,
	}
}

func (u *TaskUseCaseImpl) Create(ctx context.Context, task *entity.Task) (*entity.Task, error) {
	task, err := u.TaskRepository.Create(ctx, task)

	if err != nil {
		return nil, err
	}

	return task, nil
}

func (u *TaskUseCaseImpl) UpdateStatus(ctx context.Context, taskId string, status *entity.TaskStatus) (*entity.Task, error) {
	task, err := u.TaskRepository.UpdateStatus(ctx, taskId, status)

	if err != nil {
		return nil, err
	}

	return task, nil
}

func (u *TaskUseCaseImpl) Delete(ctx context.Context, taskId string) error {
	err := u.TaskRepository.Delete(ctx, taskId)

	if err != nil {
		return err
	}

	return nil
}
