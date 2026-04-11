package request

type CreateStatusRequest struct {
	Title      string  `json:"title" validate:"required"`
	Position   float64 `json:"position" validate:"required"`
	IsComplete bool    `json:"isComplete" validate:"omitempty"`
}

type UpdateStatusRequest struct {
	Title      *string  `json:"title" validate:"omitempty"`
	Position   *float64 `json:"position" validate:"omitempty"`
	IsComplete *bool    `json:"isComplete" validate:"omitempty"`
}

type UpdateSinglePositionRequest struct {
	Position float64 `json:"position" validate:"required"`
}
