package usecase

import (
	"context"
	"log"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	domainRepository "github.com/yoviarpauzi/coduflow/server/internal/domain/repository"
	domainUseCase "github.com/yoviarpauzi/coduflow/server/internal/domain/usecase"
)

const minStatusGap = 10.0

type TaskStatusUseCaseImpl struct {
	StatusRepository domainRepository.TaskStatusRepository
}

func NewTaskStatusUseCase(statusRepo domainRepository.TaskStatusRepository) domainUseCase.TaskStatusUseCase {
	return &TaskStatusUseCaseImpl{
		StatusRepository: statusRepo,
	}
}

func (u *TaskStatusUseCaseImpl) Create(ctx context.Context, status *entity.TaskStatus) (*entity.TaskStatus, error) {
	return u.StatusRepository.Create(ctx, status)
}

func (u *TaskStatusUseCaseImpl) GetAll(ctx context.Context) ([]entity.TaskStatus, error) {
	return u.StatusRepository.GetAll(ctx)
}

func (u *TaskStatusUseCaseImpl) Update(ctx context.Context, id string, status *entity.TaskStatus) (*entity.TaskStatus, error) {
	return u.StatusRepository.Update(ctx, id, status)
}

func (u *TaskStatusUseCaseImpl) UpdatePosition(ctx context.Context, id string, position float64) (*entity.TaskStatus, error) {
	result, err := u.StatusRepository.UpdatePosition(ctx, id, position)
	if err != nil {
		return nil, err
	}

	// Server-side gap check: trigger rebalance in background if gap is too small.
	pos := result.Position
	go func() {
		prev, next, neighborErr := u.StatusRepository.GetNeighborPositions(context.Background(), pos)
		if neighborErr != nil {
			log.Printf("warn: failed to get neighbor positions for status rebalance check: %v", neighborErr)
			return
		}
		prevGap := pos - prev
		nextGap := next - pos
		needRebalance := (prev > 0 && prevGap < minStatusGap) || (next > 0 && nextGap < minStatusGap)
		if needRebalance {
			if rebalanceErr := u.StatusRepository.RebalancePositions(context.Background()); rebalanceErr != nil {
				log.Printf("warn: status rebalance failed: %v", rebalanceErr)
			}
		}
	}()

	return result, nil
}

func (u *TaskStatusUseCaseImpl) Delete(ctx context.Context, id string) error {
	return u.StatusRepository.Delete(ctx, id)
}
