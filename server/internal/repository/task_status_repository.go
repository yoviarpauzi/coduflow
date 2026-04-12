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

type TaskStatusRepositoryImpl struct {
	DB *mongo.Database
}

func NewTaskStatusRepository(db *mongo.Database) domainRepository.TaskStatusRepository {
	return &TaskStatusRepositoryImpl{
		DB: db,
	}
}

func (r *TaskStatusRepositoryImpl) Create(ctx context.Context, taskStatus *entity.TaskStatus) (*entity.TaskStatus, error) {
	taskStatus.CreatedAt = time.Now()

	result, err := r.DB.Collection("task_statuses").InsertOne(ctx, taskStatus)
	if err != nil {
		return nil, err
	}

	id, ok := result.InsertedID.(bson.ObjectID)
	if !ok {
		return nil, fmt.Errorf("failed to cast inserted ID")
	}
	taskStatus.ID = id

	return taskStatus, nil
}

func (r *TaskStatusRepositoryImpl) GetAll(ctx context.Context) ([]entity.TaskStatus, error) {
	opts := options.Find().SetSort(bson.D{{Key: "position", Value: 1}})
	cursor, err := r.DB.Collection("task_statuses").Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var taskStatuses []entity.TaskStatus
	if err := cursor.All(ctx, &taskStatuses); err != nil {
		return nil, err
	}

	if taskStatuses == nil {
		taskStatuses = []entity.TaskStatus{}
	}

	return taskStatuses, nil
}

func (r *TaskStatusRepositoryImpl) GetByID(ctx context.Context, id string) (*entity.TaskStatus, error) {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	var taskStatus entity.TaskStatus
	err = r.DB.Collection("task_statuses").FindOne(ctx, bson.M{"_id": objectID}).Decode(&taskStatus)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, customerror.ErrStatusNotFound
		}
		return nil, err
	}

	return &taskStatus, nil
}

func (r *TaskStatusRepositoryImpl) Update(ctx context.Context, id string, taskStatus *entity.TaskStatus) (*entity.TaskStatus, error) {
	now := time.Now()

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	setElements := bson.D{
		{Key: "updated_at", Value: now},
		{Key: "title", Value: taskStatus.Title},
		{Key: "is_complete", Value: taskStatus.IsComplete},
	}

	update := bson.M{
		"$set": setElements,
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var updatedStatus entity.TaskStatus
	err = r.DB.Collection("task_statuses").
		FindOneAndUpdate(ctx, bson.M{"_id": objectID}, update, opts).
		Decode(&updatedStatus)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, customerror.ErrStatusNotFound
		}
		return nil, err
	}

	return &updatedStatus, nil
}

func (r *TaskStatusRepositoryImpl) UpdatePosition(ctx context.Context, id string, position float64) (*entity.TaskStatus, error) {
	now := time.Now()

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	update := bson.M{
		"$set": bson.M{
			"position":   position,
			"updated_at": now,
		},
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var updatedStatus entity.TaskStatus
	err = r.DB.Collection("task_statuses").
		FindOneAndUpdate(ctx, bson.M{"_id": objectID}, update, opts).
		Decode(&updatedStatus)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, customerror.ErrStatusNotFound
		}
		return nil, err
	}

	return &updatedStatus, nil
}

func (r *TaskStatusRepositoryImpl) Delete(ctx context.Context, id string) error {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid id: %w", err)
	}

	result := r.DB.Collection("task_statuses").FindOneAndDelete(ctx, bson.M{"_id": objectID})

	if result.Err() != nil {
		if errors.Is(result.Err(), mongo.ErrNoDocuments) {
			return customerror.ErrStatusNotFound
		}
		return result.Err()
	}

	return nil
}

func (r *TaskStatusRepositoryImpl) RebalancePositions(ctx context.Context) error {
	statuses, err := r.GetAll(ctx)
	if err != nil {
		return err
	}

	var models []mongo.WriteModel
	for i, status := range statuses {
		newPos := float64((i + 1) * 65536)
		updateModel := mongo.NewUpdateOneModel().
			SetFilter(bson.M{"_id": status.ID}).
			SetUpdate(bson.M{"$set": bson.M{"position": newPos, "updated_at": time.Now()}})
		models = append(models, updateModel)
	}

	if len(models) == 0 {
		return nil
	}

	opts := options.BulkWrite().SetOrdered(false)
	_, err = r.DB.Collection("task_statuses").BulkWrite(ctx, models, opts)
	return err
}

// GetNeighborPositions returns the position of the nearest status below and above the given position.
// A zero value means there is no neighbor in that direction.
func (r *TaskStatusRepositoryImpl) GetNeighborPositions(ctx context.Context, position float64) (prev float64, next float64, err error) {
	// Find the largest position that is strictly less than `position`
	prevOpts := options.FindOne().SetSort(bson.D{{Key: "position", Value: -1}})
	var prevStatus entity.TaskStatus
	prevErr := r.DB.Collection("task_statuses").
		FindOne(ctx, bson.M{"position": bson.M{"$lt": position}}, prevOpts).
		Decode(&prevStatus)
	if prevErr != nil && !errors.Is(prevErr, mongo.ErrNoDocuments) {
		return 0, 0, prevErr
	}
	prev = prevStatus.Position

	// Find the smallest position that is strictly greater than `position`
	nextOpts := options.FindOne().SetSort(bson.D{{Key: "position", Value: 1}})
	var nextStatus entity.TaskStatus
	nextErr := r.DB.Collection("task_statuses").
		FindOne(ctx, bson.M{"position": bson.M{"$gt": position}}, nextOpts).
		Decode(&nextStatus)
	if nextErr != nil && !errors.Is(nextErr, mongo.ErrNoDocuments) {
		return 0, 0, nextErr
	}
	next = nextStatus.Position

	return prev, next, nil
}
