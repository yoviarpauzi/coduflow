package handler

import (
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/middleware"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/request"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/response"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/customerror"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	domainUseCase "github.com/yoviarpauzi/coduflow/server/internal/domain/usecase"
)

type TaskHandler struct {
	Validate    *validator.Validate
	TaskUseCase domainUseCase.TaskUseCase
}

func NewTaskHandler(validate *validator.Validate, taskUseCase domainUseCase.TaskUseCase) *TaskHandler {
	return &TaskHandler{
		Validate:    validate,
		TaskUseCase: taskUseCase,
	}
}

func (h *TaskHandler) Create(c fiber.Ctx) error {
	req := new(request.CreateTaskRequest)

	if err := bindAndValidateRequest(c, h.Validate, req); err != nil {
		return err
	}
	if err := validateTaskStatusID(req.TaskStatusID); err != nil {
		return badRequestError(c, err.Message)
	}

	task := &entity.Task{
		Name:          req.Name,
		Description:   req.Description,
		Priority:      req.Priority,
		EstimatedTime: req.EstimatedTime,
		LoggedTime:    req.LoggedTime,
		DueDate:       req.DueDate,
		Position:      req.Position,
	}

	result, err := h.TaskUseCase.Create(c.Context(), req.TaskStatusID, task)

	if err != nil {
		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to create task",
			},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

func (h *TaskHandler) GetAll(c fiber.Ctx) error {
	searchQuery := c.Query("search")
	result, err := h.TaskUseCase.GetAll(c.Context(), searchQuery)

	if err != nil {
		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to get tasks",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

func (h *TaskHandler) UpdateStatus(c fiber.Ctx) error {
	id := c.Params("id")
	if err := validatePathObjectID(c, id); err != nil {
		return err
	}

	req := new(request.UpdateStatusTaskRequest)

	if err := bindAndValidateRequest(c, h.Validate, req); err != nil {
		return err
	}
	if err := validateTaskStatusID(req.TaskStatusID); err != nil {
		return badRequestError(c, err.Message)
	}

	result, err := h.TaskUseCase.UpdateStatus(c.Context(), id, req.TaskStatusID)
	if err != nil {
		if errors.Is(err, customerror.ErrTaskNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "NOT_FOUND",
					Message: "task not found",
				},
			})
		}

		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to update task status",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

func (h *TaskHandler) UpdatePosition(c fiber.Ctx) error {
	id := c.Params("id")
	if err := validatePathObjectID(c, id); err != nil {
		return err
	}

	req := new(request.UpdateTaskPositionRequest)

	if err := bindAndValidateRequest(c, h.Validate, req); err != nil {
		return err
	}
	if err := validateTaskStatusID(req.TaskStatusID); err != nil {
		return badRequestError(c, err.Message)
	}

	result, err := h.TaskUseCase.UpdatePosition(c.Context(), id, req.Position, req.TaskStatusID)
	if err != nil {
		if errors.Is(err, customerror.ErrTaskNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "NOT_FOUND",
					Message: "task not found",
				},
			})
		}
		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to update task position",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

func (h *TaskHandler) UpdateLoggedTime(c fiber.Ctx) error {
	id := c.Params("id")
	if err := validatePathObjectID(c, id); err != nil {
		return err
	}

	req := new(request.UpdateLoggedTimeTaskRequest)
	if err := bindAndValidateRequest(c, h.Validate, req); err != nil {
		return err
	}

	result, err := h.TaskUseCase.UpdateLoggedTime(c.Context(), id, req.LoggedTime)
	if err != nil {
		if errors.Is(err, customerror.ErrTaskNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "NOT_FOUND",
					Message: "task not found",
				},
			})
		}

		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to update task logged time",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

func (h *TaskHandler) Update(c fiber.Ctx) error {
	id := c.Params("id")
	if err := validatePathObjectID(c, id); err != nil {
		return err
	}

	req := new(request.UpdateTaskRequest)

	if err := bindAndValidateRequest(c, h.Validate, req); err != nil {
		return err
	}
	if err := validateOptionalTaskStatusID(req.TaskStatusID); err != nil {
		return badRequestError(c, err.Message)
	}

	existingTask, err := h.TaskUseCase.GetByID(c.Context(), id)
	if err != nil {
		if errors.Is(err, customerror.ErrTaskNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "NOT_FOUND",
					Message: "task not found",
				},
			})
		}

		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to get task",
			},
		})
	}

	if isTaskUpdateNoOp(req) {
		return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
			Success: true,
			Data:    existingTask,
		})
	}

	taskStatusID, mergedTask := mergeTaskUpdate(existingTask, req)

	result, err := h.TaskUseCase.Update(c.Context(), id, taskStatusID, mergedTask)
	if err != nil {
		if errors.Is(err, customerror.ErrTaskNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "NOT_FOUND",
					Message: "task not found",
				},
			})
		}

		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to update task",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

func (h *TaskHandler) Delete(c fiber.Ctx) error {
	id := c.Params("id")
	if err := validatePathObjectID(c, id); err != nil {
		return err
	}

	err := h.TaskUseCase.Delete(c.Context(), id)

	if err != nil {
		if errors.Is(err, customerror.ErrTaskNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "NOT_FOUND",
					Message: "task not found",
				},
			})
		}

		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to delete task",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
	})
}
