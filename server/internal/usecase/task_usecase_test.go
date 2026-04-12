package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	"go.uber.org/zap"
)

type taskRepositoryStub struct {
	getByIDFn           func(context.Context, string) (*entity.Task, error)
	updatePositionFn    func(context.Context, string, float64, string) (*entity.Task, error)
	updateFn            func(context.Context, string, string, *entity.Task) (*entity.Task, error)
	getByIDCalls        int
	updatePositionCalls int
	updateCalls         int
}

func (s *taskRepositoryStub) Create(context.Context, string, *entity.Task) (*entity.Task, error) {
	return nil, nil
}

func (s *taskRepositoryStub) GetAll(context.Context, string) ([]entity.Task, error) {
	return nil, nil
}

func (s *taskRepositoryStub) GetByID(ctx context.Context, id string) (*entity.Task, error) {
	s.getByIDCalls++
	if s.getByIDFn != nil {
		return s.getByIDFn(ctx, id)
	}
	return nil, nil
}

func (s *taskRepositoryStub) UpdateStatus(context.Context, string, string) (*entity.Task, error) {
	return nil, nil
}

func (s *taskRepositoryStub) UpdateLoggedTime(context.Context, string, int) (*entity.Task, error) {
	return nil, nil
}

func (s *taskRepositoryStub) UpdatePosition(ctx context.Context, id string, position float64, taskStatusID string) (*entity.Task, error) {
	s.updatePositionCalls++
	if s.updatePositionFn != nil {
		return s.updatePositionFn(ctx, id, position, taskStatusID)
	}
	return nil, nil
}

func (s *taskRepositoryStub) Update(ctx context.Context, id string, taskStatusID string, task *entity.Task) (*entity.Task, error) {
	s.updateCalls++
	if s.updateFn != nil {
		return s.updateFn(ctx, id, taskStatusID, task)
	}

	return task, nil
}

func (s *taskRepositoryStub) Delete(context.Context, string) error {
	return nil
}

func (s *taskRepositoryStub) RebalancePositions(context.Context, string) error {
	return nil
}

func (s *taskRepositoryStub) GetNeighborPositions(context.Context, string, float64) (float64, float64, error) {
	return 0, 0, nil
}

func TestTaskUseCaseUpdate_TableDriven(t *testing.T) {
	tests := []struct {
		name       string
		setup      func(*taskRepositoryStub)
		expectErr  bool
		expectCall int
	}{
		{
			name: "successful update",
			setup: func(stub *taskRepositoryStub) {
				stub.updateFn = func(_ context.Context, _ string, _ string, task *entity.Task) (*entity.Task, error) {
					return &entity.Task{Name: task.Name, TaskStatusID: "status-1"}, nil
				}
			},
			expectErr:  false,
			expectCall: 1,
		},
		{
			name: "repository error is propagated",
			setup: func(stub *taskRepositoryStub) {
				stub.updateFn = func(context.Context, string, string, *entity.Task) (*entity.Task, error) {
					return nil, errors.New("repo failure")
				}
			},
			expectErr:  true,
			expectCall: 1,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			stub := &taskRepositoryStub{}
			tc.setup(stub)

			u := NewTaskUseCase(stub, zap.NewNop())
			result, err := u.Update(context.Background(), "task-1", "status-1", &entity.Task{Name: "task name"})

			if tc.expectErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tc.expectErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
			if stub.updateCalls != tc.expectCall {
				t.Fatalf("expected update calls %d, got %d", tc.expectCall, stub.updateCalls)
			}
			if !tc.expectErr && result == nil {
				t.Fatalf("expected non-nil result on success")
			}
		})
	}
}

func TestTaskUseCaseUpdatePosition_TableDriven(t *testing.T) {
	tests := []struct {
		name                      string
		setup                     func(*taskRepositoryStub)
		targetPosition            float64
		targetStatusID            string
		expectErr                 bool
		expectGetByIDCalls        int
		expectUpdatePositionCalls int
	}{
		{
			name: "idempotent no-op when position and status are unchanged",
			setup: func(stub *taskRepositoryStub) {
				stub.getByIDFn = func(context.Context, string) (*entity.Task, error) {
					return &entity.Task{
						ID:           "task-1",
						TaskStatusID: "status-1",
						Position:     100,
					}, nil
				}
			},
			targetPosition:            100,
			targetStatusID:            "status-1",
			expectErr:                 false,
			expectGetByIDCalls:        1,
			expectUpdatePositionCalls: 0,
		},
		{
			name: "different target triggers repository update",
			setup: func(stub *taskRepositoryStub) {
				stub.getByIDFn = func(context.Context, string) (*entity.Task, error) {
					return &entity.Task{
						ID:           "task-1",
						TaskStatusID: "status-1",
						Position:     100,
					}, nil
				}
				stub.updatePositionFn = func(context.Context, string, float64, string) (*entity.Task, error) {
					return &entity.Task{
						ID:           "task-1",
						TaskStatusID: "status-1",
						Position:     200,
					}, nil
				}
			},
			targetPosition:            200,
			targetStatusID:            "status-1",
			expectErr:                 false,
			expectGetByIDCalls:        1,
			expectUpdatePositionCalls: 1,
		},
		{
			name: "get by id error is propagated",
			setup: func(stub *taskRepositoryStub) {
				stub.getByIDFn = func(context.Context, string) (*entity.Task, error) {
					return nil, errors.New("get error")
				}
			},
			targetPosition:            200,
			targetStatusID:            "status-1",
			expectErr:                 true,
			expectGetByIDCalls:        1,
			expectUpdatePositionCalls: 0,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			stub := &taskRepositoryStub{}
			tc.setup(stub)

			u := NewTaskUseCase(stub, zap.NewNop())
			_, err := u.UpdatePosition(context.Background(), "task-1", tc.targetPosition, tc.targetStatusID)

			if tc.expectErr && err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !tc.expectErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
			if stub.getByIDCalls != tc.expectGetByIDCalls {
				t.Fatalf("expected getByID calls %d, got %d", tc.expectGetByIDCalls, stub.getByIDCalls)
			}
			if stub.updatePositionCalls != tc.expectUpdatePositionCalls {
				t.Fatalf("expected updatePosition calls %d, got %d", tc.expectUpdatePositionCalls, stub.updatePositionCalls)
			}
		})
	}
}
