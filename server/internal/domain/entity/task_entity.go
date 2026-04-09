package entity

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type TaskStatus string
type TaskPriority int

const (
	TaskStatusTodo     TaskStatus = "TODO"
	TaskStatusDoing    TaskStatus = "DOING"
	TaskStatusComplete TaskStatus = "COMPLETE"
)
const (
	TaskStatusCritical TaskPriority = 1
	TaskStatusHigh     TaskPriority = 2
	TaskStatusMedium   TaskPriority = 3
	TaskStatusLow      TaskPriority = 4
	TaskStatusLowest   TaskPriority = 5
)

type Task struct {
	ID            bson.ObjectID `bson:"_id,omitempty"`
	Name          string        `bson:"name"`
	Status        TaskStatus    `bson:"status"`
	Priority      *TaskPriority `bson:"priority,omitempty"`
	Position      float64       `bson:"priority"`
	EstimatedTime int           `bson:"estimated_time"`
	LoggedTime    int           `bson:"logged_time"`
	DueDate       *time.Time    `bson:"due_date,omitempty"`
	CreatedAt     time.Time     `bson:"created_at"`
	UpdatedAt     *time.Time    `bson:"updated_at,omitempty"`
}
