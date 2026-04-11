package customerror

import "errors"

var (
	ErrTaskNotFound   = errors.New("task not found")
	ErrStatusNotFound = errors.New("status not found")
)
