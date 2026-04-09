package handler

import (
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func validateObjectID(c fiber.Ctx, id string) *fiber.Error {
	if id == "" {
		return fiber.NewError(fiber.StatusBadRequest, "id is required")
	}

	if _, err := bson.ObjectIDFromHex(id); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id format")
	}

	return nil
}
