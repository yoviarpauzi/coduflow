package entity

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type TaskStatus struct {
	ID         bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Title      string        `bson:"title" json:"title"`
	Position   float64       `bson:"position" json:"position"`
	IsComplete bool          `bson:"is_complete" json:"isComplete"`
	CreatedAt  time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt  *time.Time    `bson:"updated_at,omitempty" json:"updated_at"`
}
