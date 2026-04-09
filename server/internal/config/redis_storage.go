package config

import (
	"net"
	"strconv"

	redisStore "github.com/gofiber/storage/redis/v3"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

func NewRedisStorage(config *viper.Viper, log *zap.Logger) *redisStore.Storage {
	addr := config.GetString("REDIS_ADDRESS")

	host, p, err := net.SplitHostPort(addr)
	if err != nil {
		log.Fatal("invalid redis address", zap.String("addr", addr), zap.Error(err))
	}

	port, err := strconv.Atoi(p)
	if err != nil {
		log.Fatal("invalid redis port", zap.String("port", p), zap.Error(err))
	}

	store := redisStore.New(redisStore.Config{
		Host:     host,
		Port:     port,
		Password: config.GetString("REDIS_PASSWORD"),
		Database: config.GetInt("REDIS_DB"),
	})

	return store
}
