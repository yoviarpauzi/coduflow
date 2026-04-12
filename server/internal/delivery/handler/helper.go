package handler

import (
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/middleware"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/request"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/response"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func bindAndValidateRequest(c fiber.Ctx, validate *validator.Validate, req any) error {
	if err := c.Bind().Body(req); err != nil {
		middleware.AddLogContext(c, "msg", err.Error())
		return badRequestError(c, "cannot parse json")
	}

	if err := validate.Struct(req); err != nil {
		middleware.AddLogContext(c, "msg", "validation failed")
		return response.HandleValidationError(c, err)
	}

	return nil
}

func validateObjectID(c fiber.Ctx, id string) *fiber.Error {
	return validateRequiredObjectID("id", id)
}

func validatePathObjectID(c fiber.Ctx, id string) error {
	if err := validateObjectID(c, id); err != nil {
		return badRequestError(c, err.Message)
	}

	return nil
}

func validateTaskStatusID(taskStatusID string) *fiber.Error {
	return validateRequiredObjectID("task_status_id", taskStatusID)
}

func validateOptionalTaskStatusID(taskStatusID *string) *fiber.Error {
	if taskStatusID == nil {
		return nil
	}

	return validateRequiredObjectID("task_status_id", *taskStatusID)
}

func validateRequiredObjectID(fieldName string, value string) *fiber.Error {
	if value == "" {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("%s is required", fieldName))
	}

	if _, err := bson.ObjectIDFromHex(value); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("invalid %s format", fieldName))
	}

	return nil
}

func badRequestError(c fiber.Ctx, message string) error {
	return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
		Success: false,
		Error: response.ErrorDetail{
			Code:    "BAD_REQUEST",
			Message: message,
		},
	})
}

func isTaskUpdateNoOp(req *request.UpdateTaskRequest) bool {
	return req.Name == nil &&
		req.Description == nil &&
		req.TaskStatusID == nil &&
		req.Priority == nil &&
		req.Position == nil &&
		req.EstimatedTime == nil &&
		req.LoggedTime == nil &&
		req.DueDate == nil
}

func mergeTaskUpdate(existing *entity.Task, req *request.UpdateTaskRequest) (string, *entity.Task) {
	mergedTaskStatusID := existing.TaskStatusID
	if req.TaskStatusID != nil {
		mergedTaskStatusID = *req.TaskStatusID
	}

	mergedTask := &entity.Task{
		Name:          existing.Name,
		Description:   existing.Description,
		Priority:      existing.Priority,
		Position:      existing.Position,
		EstimatedTime: existing.EstimatedTime,
		LoggedTime:    existing.LoggedTime,
		DueDate:       existing.DueDate,
	}

	if req.Name != nil {
		mergedTask.Name = *req.Name
	}
	if req.Description != nil {
		mergedTask.Description = req.Description
	}
	if req.Priority != nil {
		mergedTask.Priority = req.Priority
	}
	if req.Position != nil {
		mergedTask.Position = *req.Position
	}
	if req.EstimatedTime != nil {
		mergedTask.EstimatedTime = req.EstimatedTime
	}
	if req.LoggedTime != nil {
		mergedTask.LoggedTime = req.LoggedTime
	}
	if req.DueDate != nil {
		mergedTask.DueDate = req.DueDate
	}

	return mergedTaskStatusID, mergedTask
}

func isTaskStatusUpdateNoOp(req *request.UpdateStatusRequest) bool {
	return req.Title == nil && req.Position == nil && req.IsComplete == nil
}

func mergeTaskStatusUpdate(existing *entity.TaskStatus, req *request.UpdateStatusRequest) *entity.TaskStatus {
	merged := &entity.TaskStatus{
		Title:      existing.Title,
		Position:   existing.Position,
		IsComplete: existing.IsComplete,
	}

	if req.Title != nil {
		merged.Title = *req.Title
	}
	if req.Position != nil {
		merged.Position = *req.Position
	}
	if req.IsComplete != nil {
		merged.IsComplete = *req.IsComplete
	}

	return merged
}
