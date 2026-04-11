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

type TaskStatusHandler struct {
	Validate      *validator.Validate
	StatusUseCase domainUseCase.TaskStatusUseCase
}

func NewTaskStatusHandler(validate *validator.Validate, statusUseCase domainUseCase.TaskStatusUseCase) *TaskStatusHandler {
	return &TaskStatusHandler{
		Validate:      validate,
		StatusUseCase: statusUseCase,
	}
}

func (h *TaskStatusHandler) Create(c fiber.Ctx) error {
	req := new(request.CreateStatusRequest)

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

	status := &entity.TaskStatus{
		Title:      req.Title,
		Position:   req.Position,
		IsComplete: req.IsComplete,
	}

	result, err := h.StatusUseCase.Create(c.Context(), status)

	if err != nil {
		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to create status",
			},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

func (h *TaskStatusHandler) GetAll(c fiber.Ctx) error {
	result, err := h.StatusUseCase.GetAll(c.Context())

	if err != nil {
		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to get statuses",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

func (h *TaskStatusHandler) Update(c fiber.Ctx) error {
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

	req := new(request.UpdateStatusRequest)

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

	status := &entity.TaskStatus{
		Title:      *req.Title,
		IsComplete: *req.IsComplete,
	}

	result, err := h.StatusUseCase.Update(c.Context(), id, status)
	if err != nil {
		if errors.Is(err, customerror.ErrStatusNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "NOT_FOUND",
					Message: "status not found",
				},
			})
		}

		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to update status",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

// UpdatePosition handles a single status position update with server-side gap check.
func (h *TaskStatusHandler) UpdatePosition(c fiber.Ctx) error {
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

	req := new(request.UpdateSinglePositionRequest)

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

	result, err := h.StatusUseCase.UpdatePosition(c.Context(), id, req.Position)
	if err != nil {
		if errors.Is(err, customerror.ErrStatusNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "NOT_FOUND",
					Message: "status not found",
				},
			})
		}
		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to update status position",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
		Data:    result,
	})
}

func (h *TaskStatusHandler) Delete(c fiber.Ctx) error {
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

	err := h.StatusUseCase.Delete(c.Context(), id)

	if err != nil {
		if errors.Is(err, customerror.ErrStatusNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(response.ErrorResponse{
				Success: false,
				Error: response.ErrorDetail{
					Code:    "NOT_FOUND",
					Message: "status not found",
				},
			})
		}

		middleware.AddLogContext(c, "msg", err)
		return c.Status(fiber.StatusInternalServerError).JSON(response.ErrorResponse{
			Success: false,
			Error: response.ErrorDetail{
				Code:    "INTERNAL_SERVER_ERROR",
				Message: "failed to delete status",
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(response.SuccessResponse{
		Success: true,
	})
}
