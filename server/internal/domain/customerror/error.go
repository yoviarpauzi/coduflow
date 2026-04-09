package customerror

import "errors"

var (
	ErrTaskNotFound = errors.New("task not found")
)
