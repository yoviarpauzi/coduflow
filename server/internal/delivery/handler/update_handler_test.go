package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/customerror"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	domainUseCase "github.com/yoviarpauzi/coduflow/server/internal/domain/usecase"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type taskUseCaseStub struct {
	getByIDFn           func(context.Context, string) (*entity.Task, error)
	updateFn            func(context.Context, string, string, *entity.Task) (*entity.Task, error)
	createCalls         int
	getByIDCalls        int
	updateStatusCalls   int
	updatePositionCalls int
	updateCalls         int
}

func (s *taskUseCaseStub) Create(context.Context, string, *entity.Task) (*entity.Task, error) {
	s.createCalls++
	return nil, nil
}

func (s *taskUseCaseStub) GetAll(context.Context, string) ([]entity.Task, error) {
	return nil, nil
}

func (s *taskUseCaseStub) GetByID(ctx context.Context, id string) (*entity.Task, error) {
	s.getByIDCalls++
	if s.getByIDFn != nil {
		return s.getByIDFn(ctx, id)
	}
	return nil, nil
}

func (s *taskUseCaseStub) UpdateStatus(context.Context, string, string) (*entity.Task, error) {
	s.updateStatusCalls++
	return nil, nil
}

func (s *taskUseCaseStub) UpdateLoggedTime(context.Context, string, int) (*entity.Task, error) {
	return nil, nil
}

func (s *taskUseCaseStub) UpdatePosition(context.Context, string, float64, string) (*entity.Task, error) {
	s.updatePositionCalls++
	return nil, nil
}

func (s *taskUseCaseStub) Update(ctx context.Context, id string, taskStatusID string, task *entity.Task) (*entity.Task, error) {
	s.updateCalls++
	if s.updateFn != nil {
		return s.updateFn(ctx, id, taskStatusID, task)
	}
	return task, nil
}

func (s *taskUseCaseStub) Delete(context.Context, string) error {
	return nil
}

var _ domainUseCase.TaskUseCase = (*taskUseCaseStub)(nil)

type taskStatusUseCaseStub struct {
	getByIDFn           func(context.Context, string) (*entity.TaskStatus, error)
	updateFn            func(context.Context, string, *entity.TaskStatus) (*entity.TaskStatus, error)
	getByIDCalls        int
	updateCalls         int
	updatePositionCalls int
}

func (s *taskStatusUseCaseStub) Create(context.Context, *entity.TaskStatus) (*entity.TaskStatus, error) {
	return nil, nil
}

func (s *taskStatusUseCaseStub) GetAll(context.Context) ([]entity.TaskStatus, error) {
	return nil, nil
}

func (s *taskStatusUseCaseStub) GetByID(ctx context.Context, id string) (*entity.TaskStatus, error) {
	s.getByIDCalls++
	if s.getByIDFn != nil {
		return s.getByIDFn(ctx, id)
	}
	return nil, nil
}

func (s *taskStatusUseCaseStub) Update(ctx context.Context, id string, status *entity.TaskStatus) (*entity.TaskStatus, error) {
	s.updateCalls++
	if s.updateFn != nil {
		return s.updateFn(ctx, id, status)
	}
	return status, nil
}

func (s *taskStatusUseCaseStub) UpdatePosition(context.Context, string, float64) (*entity.TaskStatus, error) {
	s.updatePositionCalls++
	return nil, nil
}

func (s *taskStatusUseCaseStub) Delete(context.Context, string) error {
	return nil
}

var _ domainUseCase.TaskStatusUseCase = (*taskStatusUseCaseStub)(nil)

func performJSONRequest(t *testing.T, app *fiber.App, method string, path string, body map[string]any) *http.Response {
	t.Helper()

	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal body: %v", err)
	}

	req := httptest.NewRequest(method, path, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app test request failed: %v", err)
	}

	return resp
}

func TestTaskHandlerUpdate_PartialSingleFieldMergesExistingState(t *testing.T) {
	id := bson.NewObjectID().Hex()
	statusID := bson.NewObjectID().Hex()
	stub := &taskUseCaseStub{}
	stub.getByIDFn = func(context.Context, string) (*entity.Task, error) {
		p := entity.TaskPriorityHigh
		et := 30
		return &entity.Task{
			Name:          "old",
			TaskStatusID:  statusID,
			Position:      12,
			Priority:      &p,
			EstimatedTime: &et,
		}, nil
	}

	var capturedTask *entity.Task
	var capturedStatusID string
	stub.updateFn = func(_ context.Context, _ string, taskStatusID string, task *entity.Task) (*entity.Task, error) {
		capturedTask = task
		capturedStatusID = taskStatusID
		return task, nil
	}

	h := NewTaskHandler(validator.New(), stub)
	app := fiber.New()
	app.Put("/task/:id", h.Update)

	resp := performJSONRequest(t, app, http.MethodPut, "/task/"+id, map[string]any{"name": "new"})
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if stub.updateCalls != 1 {
		t.Fatalf("expected update called once, got %d", stub.updateCalls)
	}
	if capturedTask == nil || capturedTask.Name != "new" {
		t.Fatalf("expected merged name to be updated")
	}
	if capturedTask.Position != 12 {
		t.Fatalf("expected existing position to be preserved, got %v", capturedTask.Position)
	}
	if capturedStatusID != statusID {
		t.Fatalf("expected task status id to be preserved")
	}
}

func TestTaskHandlerUpdate_AllFieldsNilNoOp(t *testing.T) {
	id := bson.NewObjectID().Hex()
	stub := &taskUseCaseStub{}
	stub.getByIDFn = func(context.Context, string) (*entity.Task, error) {
		return &entity.Task{Name: "keep", Position: 9, TaskStatusID: bson.NewObjectID().Hex()}, nil
	}

	h := NewTaskHandler(validator.New(), stub)
	app := fiber.New()
	app.Put("/task/:id", h.Update)

	resp := performJSONRequest(t, app, http.MethodPut, "/task/"+id, map[string]any{})
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if stub.updateCalls != 0 {
		t.Fatalf("expected no DB update call, got %d", stub.updateCalls)
	}
}

func TestTaskHandlerUpdate_NumericZeroIsValidUpdate(t *testing.T) {
	id := bson.NewObjectID().Hex()
	statusID := bson.NewObjectID().Hex()
	stub := &taskUseCaseStub{}
	stub.getByIDFn = func(context.Context, string) (*entity.Task, error) {
		return &entity.Task{Name: "keep", Position: 5, TaskStatusID: statusID}, nil
	}

	var capturedTask *entity.Task
	stub.updateFn = func(_ context.Context, _ string, _ string, task *entity.Task) (*entity.Task, error) {
		capturedTask = task
		return task, nil
	}

	h := NewTaskHandler(validator.New(), stub)
	app := fiber.New()
	app.Put("/task/:id", h.Update)

	resp := performJSONRequest(t, app, http.MethodPut, "/task/"+id, map[string]any{"position": 0})
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if stub.updateCalls != 1 {
		t.Fatalf("expected update call, got %d", stub.updateCalls)
	}
	if capturedTask == nil || capturedTask.Position != 0 {
		t.Fatalf("expected position to update to zero")
	}
}

func TestTaskHandlerUpdate_NotFoundReturns404(t *testing.T) {
	id := bson.NewObjectID().Hex()
	stub := &taskUseCaseStub{}
	stub.getByIDFn = func(context.Context, string) (*entity.Task, error) {
		return nil, customerror.ErrTaskNotFound
	}

	h := NewTaskHandler(validator.New(), stub)
	app := fiber.New()
	app.Put("/task/:id", h.Update)

	resp := performJSONRequest(t, app, http.MethodPut, "/task/"+id, map[string]any{})
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", resp.StatusCode)
	}
	if stub.updateCalls != 0 {
		t.Fatalf("expected no update call for missing entity")
	}
}

func TestTaskStatusHandlerUpdate_AllFieldsNilNoOp(t *testing.T) {
	id := bson.NewObjectID().Hex()
	stub := &taskStatusUseCaseStub{}
	stub.getByIDFn = func(context.Context, string) (*entity.TaskStatus, error) {
		return &entity.TaskStatus{Title: "todo", IsComplete: true}, nil
	}

	h := NewTaskStatusHandler(validator.New(), stub)
	app := fiber.New()
	app.Put("/status/:id", h.Update)

	resp := performJSONRequest(t, app, http.MethodPut, "/status/"+id, map[string]any{})
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if stub.updateCalls != 0 {
		t.Fatalf("expected no DB update call, got %d", stub.updateCalls)
	}
}

func TestTaskStatusHandlerUpdate_BooleanFalseIsValidUpdate(t *testing.T) {
	id := bson.NewObjectID().Hex()
	stub := &taskStatusUseCaseStub{}
	stub.getByIDFn = func(context.Context, string) (*entity.TaskStatus, error) {
		return &entity.TaskStatus{Title: "done", IsComplete: true}, nil
	}

	var captured *entity.TaskStatus
	stub.updateFn = func(_ context.Context, _ string, status *entity.TaskStatus) (*entity.TaskStatus, error) {
		captured = status
		return status, nil
	}

	h := NewTaskStatusHandler(validator.New(), stub)
	app := fiber.New()
	app.Put("/status/:id", h.Update)

	resp := performJSONRequest(t, app, http.MethodPut, "/status/"+id, map[string]any{"isComplete": false})
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if stub.updateCalls != 1 {
		t.Fatalf("expected update call, got %d", stub.updateCalls)
	}
	if captured == nil || captured.IsComplete {
		t.Fatalf("expected isComplete to update to false")
	}
}

func TestTaskStatusHandlerUpdate_PartialPositionMergesExistingState(t *testing.T) {
	id := bson.NewObjectID().Hex()
	stub := &taskStatusUseCaseStub{}
	stub.getByIDFn = func(context.Context, string) (*entity.TaskStatus, error) {
		return &entity.TaskStatus{Title: "todo", Position: 10, IsComplete: false}, nil
	}

	var captured *entity.TaskStatus
	stub.updateFn = func(_ context.Context, _ string, status *entity.TaskStatus) (*entity.TaskStatus, error) {
		captured = status
		return status, nil
	}

	h := NewTaskStatusHandler(validator.New(), stub)
	app := fiber.New()
	app.Put("/status/:id", h.Update)

	resp := performJSONRequest(t, app, http.MethodPut, "/status/"+id, map[string]any{"position": 0})
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if stub.updateCalls != 1 {
		t.Fatalf("expected update call, got %d", stub.updateCalls)
	}
	if captured == nil || captured.Position != 0 {
		t.Fatalf("expected position to update to zero")
	}
	if captured.Title != "todo" {
		t.Fatalf("expected existing title to be preserved")
	}
}

func TestTaskHandlerCreate_InvalidTaskStatusIDReturns400(t *testing.T) {
	stub := &taskUseCaseStub{}
	h := NewTaskHandler(validator.New(), stub)
	app := fiber.New()
	app.Post("/task", h.Create)

	resp := performJSONRequest(t, app, http.MethodPost, "/task", map[string]any{
		"name":           "Task A",
		"task_status_id": "invalid-object-id",
		"position":       1,
	})

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
	if stub.createCalls != 0 {
		t.Fatalf("expected no create call, got %d", stub.createCalls)
	}
}

func TestTaskHandlerUpdateStatus_InvalidTaskStatusIDReturns400(t *testing.T) {
	stub := &taskUseCaseStub{}
	h := NewTaskHandler(validator.New(), stub)
	app := fiber.New()
	app.Patch("/task/:id/status", h.UpdateStatus)

	resp := performJSONRequest(t, app, http.MethodPatch, "/task/"+bson.NewObjectID().Hex()+"/status", map[string]any{
		"task_status_id": "invalid-object-id",
	})

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
	if stub.updateStatusCalls != 0 {
		t.Fatalf("expected no update status call, got %d", stub.updateStatusCalls)
	}
}

func TestTaskHandlerUpdatePosition_InvalidTaskStatusIDReturns400(t *testing.T) {
	stub := &taskUseCaseStub{}
	h := NewTaskHandler(validator.New(), stub)
	app := fiber.New()
	app.Patch("/task/:id/position", h.UpdatePosition)

	resp := performJSONRequest(t, app, http.MethodPatch, "/task/"+bson.NewObjectID().Hex()+"/position", map[string]any{
		"task_status_id": "invalid-object-id",
		"position":       1,
	})

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
	if stub.updatePositionCalls != 0 {
		t.Fatalf("expected no update position call, got %d", stub.updatePositionCalls)
	}
}

func TestTaskHandlerUpdate_InvalidTaskStatusIDReturns400(t *testing.T) {
	stub := &taskUseCaseStub{}
	h := NewTaskHandler(validator.New(), stub)
	app := fiber.New()
	app.Put("/task/:id", h.Update)

	resp := performJSONRequest(t, app, http.MethodPut, "/task/"+bson.NewObjectID().Hex(), map[string]any{
		"task_status_id": "invalid-object-id",
	})

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
	if stub.getByIDCalls != 0 {
		t.Fatalf("expected no get by id call, got %d", stub.getByIDCalls)
	}
	if stub.updateCalls != 0 {
		t.Fatalf("expected no update call, got %d", stub.updateCalls)
	}
}

func TestTaskHandlerUpdate_TableDriven(t *testing.T) {
	type expected struct {
		statusCode   int
		getByIDCalls int
		updateCalls  int
	}

	tests := []struct {
		name   string
		pathID string
		body   map[string]any
		setup  func(*taskUseCaseStub)
		expect expected
	}{
		{
			name:   "partial update with nil fields returns no-op",
			pathID: bson.NewObjectID().Hex(),
			body:   map[string]any{},
			setup: func(stub *taskUseCaseStub) {
				stub.getByIDFn = func(context.Context, string) (*entity.Task, error) {
					return &entity.Task{
						Name:         "keep",
						Position:     10,
						TaskStatusID: bson.NewObjectID().Hex(),
					}, nil
				}
			},
			expect: expected{
				statusCode:   http.StatusOK,
				getByIDCalls: 1,
				updateCalls:  0,
			},
		},
		{
			name:   "invalid object id returns 400",
			pathID: bson.NewObjectID().Hex(),
			body:   map[string]any{"task_status_id": "invalid-object-id"},
			setup:  func(_ *taskUseCaseStub) {},
			expect: expected{
				statusCode:   http.StatusBadRequest,
				getByIDCalls: 0,
				updateCalls:  0,
			},
		},
		{
			name:   "successful update",
			pathID: bson.NewObjectID().Hex(),
			body:   map[string]any{"name": "new-name"},
			setup: func(stub *taskUseCaseStub) {
				statusID := bson.NewObjectID().Hex()
				stub.getByIDFn = func(context.Context, string) (*entity.Task, error) {
					return &entity.Task{
						Name:         "old-name",
						Position:     5,
						TaskStatusID: statusID,
					}, nil
				}
				stub.updateFn = func(_ context.Context, _ string, taskStatusID string, task *entity.Task) (*entity.Task, error) {
					return &entity.Task{
						Name:         task.Name,
						Position:     task.Position,
						TaskStatusID: taskStatusID,
					}, nil
				}
			},
			expect: expected{
				statusCode:   http.StatusOK,
				getByIDCalls: 1,
				updateCalls:  1,
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			stub := &taskUseCaseStub{}
			tc.setup(stub)

			h := NewTaskHandler(validator.New(), stub)
			app := fiber.New()
			app.Put("/task/:id", h.Update)

			resp := performJSONRequest(t, app, http.MethodPut, "/task/"+tc.pathID, tc.body)
			if resp.StatusCode != tc.expect.statusCode {
				t.Fatalf("expected status %d, got %d", tc.expect.statusCode, resp.StatusCode)
			}
			if stub.getByIDCalls != tc.expect.getByIDCalls {
				t.Fatalf("expected getByID calls %d, got %d", tc.expect.getByIDCalls, stub.getByIDCalls)
			}
			if stub.updateCalls != tc.expect.updateCalls {
				t.Fatalf("expected update calls %d, got %d", tc.expect.updateCalls, stub.updateCalls)
			}
		})
	}
}
