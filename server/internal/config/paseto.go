package config

import (
	"fmt"
	"time"

	"aidanwoods.dev/go-paseto"
	"github.com/spf13/viper"
	domainService "github.com/yoviarpauzi/coduflow/server/internal/domain/service"
)

type PasetoToken struct {
	accessTokenKey  paseto.V4SymmetricKey
	refreshTokenKey paseto.V4SymmetricKey
	accessDuration  time.Duration
	refreshDuration time.Duration
}

func NewPaseto(config *viper.Viper) (domainService.PasetoService, error) {
	accessSecret := config.GetString("PASETO_ACCESS_SECRET_KEY")
	refreshSecret := config.GetString("PASETO_REFRESH_SECRET_KEY")

	if len(accessSecret) != 32 || len(refreshSecret) != 32 {
		return nil, fmt.Errorf("invalid secret key length (must be 32 chars)")
	}

	accessKey, err := paseto.V4SymmetricKeyFromBytes([]byte(accessSecret))
	if err != nil {
		return nil, err
	}

	refreshKey, err := paseto.V4SymmetricKeyFromBytes([]byte(refreshSecret))
	if err != nil {
		return nil, err
	}

	accessDuration := config.GetDuration("PASETO_ACCESS_TOKEN_DURATION")
	refreshDuration := config.GetDuration("PASETO_REFRESH_TOKEN_DURATION")

	return &PasetoToken{
		accessTokenKey:  accessKey,
		refreshTokenKey: refreshKey,
		accessDuration:  accessDuration,
		refreshDuration: refreshDuration,
	}, nil
}

func (t *PasetoToken) GenerateAccessToken(userID string) (string, error) {
	return t.generateToken(userID, t.accessTokenKey, t.accessDuration)
}

func (t *PasetoToken) GenerateRefreshToken(userID string) (string, error) {
	return t.generateToken(userID, t.refreshTokenKey, t.refreshDuration)
}

func (t *PasetoToken) generateToken(userID string, key paseto.V4SymmetricKey, duration time.Duration) (string, error) {
	token := paseto.NewToken()
	token.SetExpiration(time.Now().Add(duration))
	token.SetString("user_id", userID)

	return token.V4Encrypt(key, nil), nil
}

func (t *PasetoToken) ValidateAccessToken(signedToken string) (string, error) {
	return t.validateToken(signedToken, t.accessTokenKey)
}

func (t *PasetoToken) ValidateRefreshToken(signedToken string) (string, error) {
	return t.validateToken(signedToken, t.refreshTokenKey)
}

func (t *PasetoToken) validateToken(signedToken string, key paseto.V4SymmetricKey) (string, error) {
	parser := paseto.NewParser()
	token, err := parser.ParseV4Local(key, signedToken, nil)
	if err != nil {
		return "", err
	}

	userID, err := token.GetString("user_id")
	if err != nil {
		return "", err
	}

	return userID, nil
}
