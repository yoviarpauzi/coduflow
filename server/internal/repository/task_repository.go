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

func (r *TaskRepositoryImpl) Create(ctx context.Context, taskStatusID string, task *entity.Task) (*entity.Task, error) {
	objectTaskStatusID, err := bson.ObjectIDFromHex(taskStatusID)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	task.CreatedAt = time.Now()
	task.TaskStatusID = objectTaskStatusID

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

func (r *TaskRepositoryImpl) GetAll(ctx context.Context, search string) ([]entity.Task, error) {
	opts := options.Find().SetSort(bson.D{{Key: "position", Value: 1}})
	filter := bson.M{}

	if search != "" {
		filter["name"] = bson.M{"$regex": search, "$options": "i"}
	}

	cursor, err := r.DB.Collection("tasks").Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []entity.Task
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}

	if tasks == nil {
		tasks = []entity.Task{}
	}

	return tasks, nil
}

func (r *TaskRepositoryImpl) UpdateLoggedTime(ctx context.Context, id string, loggedTime int) (*entity.Task, error) {
	now := time.Now()

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	filter := bson.M{
		"_id": objectID,
	}

	update := bson.M{
		"$set": bson.M{
			"logged_time": loggedTime,
			"updated_at":  now,
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
			return nil, customerror.ErrTaskNotFound
		}
		return nil, err
	}

	return &task, nil
}

func (r *TaskRepositoryImpl) UpdatePosition(ctx context.Context, id string, position float64, taskStatusID string) (*entity.Task, error) {
	now := time.Now()

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	objectTaskStatusID, err := bson.ObjectIDFromHex(taskStatusID)
	if err != nil {
		return nil, fmt.Errorf("invalid status_id: %w", err)
	}

	update := bson.M{
		"$set": bson.M{
			"position":       position,
			"task_status_id": objectTaskStatusID,
			"updated_at":     now,
		},
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var task entity.Task
	err = r.DB.Collection("tasks").
		FindOneAndUpdate(ctx, bson.M{"_id": objectID}, update, opts).
		Decode(&task)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, customerror.ErrTaskNotFound
		}
		return nil, err
	}

	return &task, nil
}

func (r *TaskRepositoryImpl) UpdateStatus(ctx context.Context, id string, taskStatusID string) (*entity.Task, error) {
	now := time.Now()

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	objectTaskStatusID, err := bson.ObjectIDFromHex(taskStatusID)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	filter := bson.M{
		"_id":            objectID,
		"task_status_id": bson.M{"$ne": objectTaskStatusID},
	}

	update := bson.M{
		"$set": bson.M{
			"task_status_id": objectTaskStatusID,
			"updated_at":     now,
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

func (r *TaskRepositoryImpl) Update(ctx context.Context, id string, taskStatusID string, task *entity.Task) (*entity.Task, error) {
	now := time.Now()

	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	objectTaskStatusID, err := bson.ObjectIDFromHex(taskStatusID)
	if err != nil {
		return nil, fmt.Errorf("invalid id: %w", err)
	}

	setElements := bson.D{
		{Key: "updated_at", Value: now},
		{Key: "name", Value: task.Name},
		{Key: "description", Value: task.Description},
		{Key: "task_status_id", Value: objectTaskStatusID},
		{Key: "priority", Value: task.Priority},
		{Key: "position", Value: task.Position},
		{Key: "estimated_time", Value: task.EstimatedTime},
		{Key: "logged_time", Value: task.LoggedTime},
		{Key: "due_date", Value: task.DueDate},
	}

	update := bson.M{
		"$set": setElements,
	}

	opts := options.FindOneAndUpdate().
		SetReturnDocument(options.After)

	var updatedTask entity.Task

	err = r.DB.Collection("tasks").
		FindOneAndUpdate(ctx, bson.M{"_id": objectID}, update, opts).
		Decode(&updatedTask)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, customerror.ErrTaskNotFound
		}
		return nil, err
	}

	return &updatedTask, nil
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

func (r *TaskRepositoryImpl) RebalancePositions(ctx context.Context, taskStatusID string) error {
	opts := options.Find().SetSort(bson.D{{Key: "position", Value: 1}})

	objectTaskStatusID, err := bson.ObjectIDFromHex(taskStatusID)
	if err != nil {
		return fmt.Errorf("invalid status_id: %w", err)
	}

	filter := bson.M{"task_status_id": objectTaskStatusID}

	cursor, err := r.DB.Collection("tasks").Find(ctx, filter, opts)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var tasks []entity.Task
	if err := cursor.All(ctx, &tasks); err != nil {
		return err
	}

	var models []mongo.WriteModel
	for i, task := range tasks {
		newPos := float64((i + 1) * 65536)
		updateModel := mongo.NewUpdateOneModel().
			SetFilter(bson.M{"_id": task.ID}).
			SetUpdate(bson.M{"$set": bson.M{"position": newPos, "updated_at": time.Now()}})
		models = append(models, updateModel)
	}

	if len(models) == 0 {
		return nil
	}

	bulkOpts := options.BulkWrite().SetOrdered(false)
	_, err = r.DB.Collection("tasks").BulkWrite(ctx, models, bulkOpts)
	return err
}

func (r *TaskRepositoryImpl) GetNeighborPositions(ctx context.Context, taskStatusID string, position float64) (prev float64, next float64, err error) {
	objectTaskStatusID, parseErr := bson.ObjectIDFromHex(taskStatusID)
	if parseErr != nil {
		return 0, 0, fmt.Errorf("invalid status_id: %w", parseErr)
	}

	// Find the largest position strictly less than `position`
	prevFilter := bson.M{"task_status_id": objectTaskStatusID, "position": bson.M{"$lt": position}}
	prevOpts := options.FindOne().SetSort(bson.D{{Key: "position", Value: -1}})
	var prevTask entity.Task
	prevErr := r.DB.Collection("tasks").FindOne(ctx, prevFilter, prevOpts).Decode(&prevTask)
	if prevErr != nil && !errors.Is(prevErr, mongo.ErrNoDocuments) {
		return 0, 0, prevErr
	}
	prev = prevTask.Position

	// Find the smallest position strictly greater than `position`
	nextFilter := bson.M{"task_status_id": objectTaskStatusID, "position": bson.M{"$gt": position}}
	nextOpts := options.FindOne().SetSort(bson.D{{Key: "position", Value: 1}})
	var nextTask entity.Task
	nextErr := r.DB.Collection("tasks").FindOne(ctx, nextFilter, nextOpts).Decode(&nextTask)
	if nextErr != nil && !errors.Is(nextErr, mongo.ErrNoDocuments) {
		return 0, 0, nextErr
	}
	next = nextTask.Position

	return prev, next, nil
}
