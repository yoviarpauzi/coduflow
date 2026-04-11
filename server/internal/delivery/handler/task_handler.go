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

	if err := c.Bind().Body(req); err != nil {
		middleware.AddLogContext(c, "msg", err.Error())
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: "cannot parse json",
			},
		})
	}

	if err := h.Validate.Struct(req); err != nil {
		middleware.AddLogContext(c, "msg", "validation failed")
		return response.HandleValidationError(c, err)
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
	if err := validateObjectID(c, id); err != nil {
		return c.Status(err.Code).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: err.Message,
			},
		})
	}

	req := new(request.UpdateStatusTaskRequest)

	if err := c.Bind().Body(req); err != nil {
		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: "cannot parse json",
			},
		})
	}

	if err := h.Validate.Struct(req); err != nil {
		middleware.AddLogContext(c, "msg", "validation failed")
		return response.HandleValidationError(c, err)
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
	if err := validateObjectID(c, id); err != nil {
		return c.Status(err.Code).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: err.Message,
			},
		})
	}

	req := new(request.UpdateTaskPositionRequest)

	if err := c.Bind().Body(req); err != nil {
		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: "cannot parse json",
			},
		})
	}

	if err := h.Validate.Struct(req); err != nil {
		middleware.AddLogContext(c, "msg", "validation failed")
		return response.HandleValidationError(c, err)
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
	if err := validateObjectID(c, id); err != nil {
		return c.Status(err.Code).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: err.Message,
			},
		})
	}

	req := new(request.UpdateLoggedTimeTaskRequest)
	if err := c.Bind().Body(req); err != nil {
		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: "cannot parse json",
			},
		})
	}

	if err := h.Validate.Struct(req); err != nil {
		middleware.AddLogContext(c, "msg", "validation failed")
		return response.HandleValidationError(c, err)
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
	if err := validateObjectID(c, id); err != nil {
		return c.Status(err.Code).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: err.Message,
			},
		})
	}

	req := new(request.UpdateTaskRequest)

	if err := c.Bind().Body(req); err != nil {
		middleware.AddLogContext(c, "msg", err.Error())
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: "cannot parse json",
			},
		})
	}

	if err := h.Validate.Struct(req); err != nil {
		middleware.AddLogContext(c, "msg", "validation failed")
		return response.HandleValidationError(c, err)
	}

	task := &entity.Task{
		Name:          *req.Name,
		Description:   req.Description,
		Priority:      req.Priority,
		Position:      *req.Position,
		EstimatedTime: req.EstimatedTime,
		LoggedTime:    req.LoggedTime,
		DueDate:       req.DueDate,
	}

	result, err := h.TaskUseCase.Update(c.Context(), id, *req.TaskStatusID, task)
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
	if err := validateObjectID(c, id); err != nil {
		return c.Status(err.Code).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "BAD_REQUEST",
				Message: err.Message,
			},
		})
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
