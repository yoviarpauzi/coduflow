package response

import (
	"errors"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
)

func HandleValidationError(c fiber.Ctx, err error) error {
	var validationErrors validator.ValidationErrors
	var details []ValidationErrorDetail

	if errors.As(err, &validationErrors) {
		for _, e := range validationErrors {
			details = append(details, ValidationErrorDetail{
				Field:   strings.ToLower(e.Field()),
				Message: getValidationMessage(e),
			})
		}
	}

	return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    "VALIDATION_ERROR",
			Message: "validation failed",
			Details: details,
		},
	})
}

func getValidationMessage(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return "field is required"
	case "oneof":
		return "value must be one of: " + e.Param()
	case "gte":
		return "value must be greater than or equal to " + e.Param()
	case "lte":
		return "value must be less than or equal to " + e.Param()
	case "min":
		return "minimum value is " + e.Param()
	case "max":
		return "maximum value is " + e.Param()
	case "email":
		return "invalid email format"
	default:
		return e.Tag()
	}
}
