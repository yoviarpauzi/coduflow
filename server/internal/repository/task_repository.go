package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/yoviarpauzi/coduflow/server/internal/domain/customerror"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/entity"
	domainRepository "github.com/yoviarpauzi/coduflow/server/internal/domain/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type TaskRepositoryImpl struct {
	DB *mongo.Database
}

func NewTaskRepository(db *mongo.Database) domainRepository.TaskRepository {
	return &TaskRepositoryImpl{
		DB: db,
	}
}

func (r *TaskRepositoryImpl) Create(ctx context.Context, task *entity.Task) (*entity.Task, error) {
	task.CreatedAt = time.Now()

	result, err := r.DB.Collection("tasks").InsertOne(ctx, task)

	if err != nil {
		return nil, err
	}

	id, ok := result.InsertedID.(bson.ObjectID)
	if !ok {
		return nil, fmt.Errorf("failed to cast inserted ID")
	}

	task.ID = id

	return task, nil
}

func (r *TaskRepositoryImpl) UpdateStatus(ctx context.Context, id string, status *entity.TaskStatus) (*entity.Task, error) {
	now := time.Now()

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	filter := bson.M{
		"_id":    objectID,
		"status": bson.M{"$ne": *status},
	}

	update := bson.M{
		"$set": bson.M{
			"status":     *status,
			"updated_at": now,
		},
	}

	opts := options.FindOneAndUpdate().
		SetReturnDocument(options.After)

	var task entity.Task

	err = r.DB.Collection("tasks").
		FindOneAndUpdate(ctx, filter, update, opts).
		Decode(&task)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			err = r.DB.Collection("tasks").
				FindOne(ctx, bson.M{"_id": objectID}).
				Decode(&task)

			if err != nil {
				if errors.Is(err, mongo.ErrNoDocuments) {
					return nil, customerror.ErrTaskNotFound
				}
				return nil, err
			}

			return &task, nil
		}

		return nil, err
	}

	return &task, nil
}

func (r *TaskRepositoryImpl) Delete(ctx context.Context, id string) error {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid id: %w", err)
	}

	result := r.DB.Collection("tasks").FindOneAndDelete(ctx, bson.M{"_id": objectID})

	if result.Err() != nil {
		if errors.Is(result.Err(), mongo.ErrNoDocuments) {
			return customerror.ErrTaskNotFound
		}
		return result.Err()
	}

	return nil
}
