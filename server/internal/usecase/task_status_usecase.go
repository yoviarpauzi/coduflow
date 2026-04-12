package usecase

import (
	"context"
	"log"
	"time"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	domainRepository "github.com/yoviarpauzi/coduflow/server/internal/domain/repository"
	domainUseCase "github.com/yoviarpauzi/coduflow/server/internal/domain/usecase"
)

const minStatusGap = 10.0
const backgroundStatusRebalanceTimeout = 5 * time.Second

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

func (u *TaskStatusUseCaseImpl) GetByID(ctx context.Context, id string) (*entity.TaskStatus, error) {
	return u.StatusRepository.GetByID(ctx, id)
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
	baseCtx := context.WithoutCancel(ctx)
	go func(bgCtx context.Context, currentPos float64) {
		neighborCtx, cancelNeighbor := context.WithTimeout(bgCtx, backgroundStatusRebalanceTimeout)
		defer cancelNeighbor()

		prev, next, neighborErr := u.StatusRepository.GetNeighborPositions(neighborCtx, currentPos)
		if neighborErr != nil {
			log.Printf("warn: failed to get neighbor positions for status rebalance check: %v", neighborErr)
			return
		}
		prevGap := currentPos - prev
		nextGap := next - currentPos
		needRebalance := (prev > 0 && prevGap < minStatusGap) || (next > 0 && nextGap < minStatusGap)
		if needRebalance {
			rebalanceCtx, cancelRebalance := context.WithTimeout(bgCtx, backgroundStatusRebalanceTimeout)
			defer cancelRebalance()

			if rebalanceErr := u.StatusRepository.RebalancePositions(rebalanceCtx); rebalanceErr != nil {
				log.Printf("warn: status rebalance failed: %v", rebalanceErr)
			}
		}
	}(baseCtx, pos)

	return result, nil
}

func (u *TaskStatusUseCaseImpl) Delete(ctx context.Context, id string) error {
	return u.StatusRepository.Delete(ctx, id)
}
