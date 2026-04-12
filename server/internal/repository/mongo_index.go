package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func CreateIndexes(ctx context.Context, db *mongo.Database) error {
	taskIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "task_status_id", Value: 1},
				{Key: "position", Value: 1},
			},
		},
	}

	_, err := db.Collection("tasks").Indexes().CreateMany(ctx, taskIndexes)

	return err
}
