package entity

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type TaskPriority int

const (
	TaskPriorityCritical TaskPriority = 1
	TaskPriorityHigh     TaskPriority = 2
	TaskPriorityMedium   TaskPriority = 3
	TaskPriorityLow      TaskPriority = 4
	TaskPriorityLowest   TaskPriority = 5
)

type Task struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TaskStatusID  bson.ObjectID `bson:"task_status_id" json:"taskStatusId"`
	Name          string        `bson:"name" json:"title"`
	Description   *string       `bson:"description,omitempty" json:"description"`
	Priority      *TaskPriority `bson:"priority,omitempty" json:"priority"`
	Position      float64       `bson:"position" json:"position"`
	EstimatedTime *int          `bson:"estimated_time" json:"estimatedTime,omitempty"`
	LoggedTime    *int          `bson:"logged_time" json:"loggedTime,omitempty"`
	DueDate       *time.Time    `bson:"due_date,omitempty" json:"dueDate"`
	CreatedAt     time.Time     `bson:"created_at" json:"createdAt"`
	UpdatedAt     *time.Time    `bson:"updated_at,omitempty" json:"updatedAt"`
}
