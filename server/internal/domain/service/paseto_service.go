package service

type PasetoService interface {
	GenerateAccessToken(userID string) (string, error)
	GenerateRefreshToken(userID string) (string, error)
	ValidateAccessToken(signedToken string) (string, error)
	ValidateRefreshToken(signedToken string) (string, error)
}
