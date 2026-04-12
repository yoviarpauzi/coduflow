package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/yoviarpauzi/coduflow/server/internal/config"
	"go.uber.org/zap"
)

func main() {
	_ = godotenv.Load()

	viperConfig := config.NewViper()
	logger := config.NewLogger(viperConfig)
	mongoClient := config.NewMongoClient(viperConfig, logger)
	validate := config.NewValidator()
	redisStore := config.NewRedisStorage(viperConfig, logger)
	app := config.NewFiber(viperConfig, logger)
	pasetoToken, err := config.NewPaseto(viperConfig)

	if err != nil {
		logger.Fatal("failed to initialize paseto", zap.Error(err))
	}

	bootstrapConfig := &config.BootstrapConfig{
		App:         app,
		DB:          mongoClient.Database(viperConfig.GetString("DB_NAME")),
		Validate:    validate,
		Config:      viperConfig,
		Log:         logger,
		PasetoToken: pasetoToken,
		RedisStore:  redisStore,
	}

	config.Bootstrap(bootstrapConfig)

	port := viperConfig.GetString("server.port")
	if port == "" {
		logger.Fatal("server port is not configured")
	}

	serverError := make(chan error, 1)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		logger.Info("Server is starting", zap.String("port", port), zap.String("app_name", viperConfig.GetString("server.name")))
		if err := app.Listen(":" + port); err != nil {
			serverError <- err
		}
	}()

	select {
	case err := <-serverError:
		logger.Fatal("Server error", zap.Error(err))
	case sig := <-quit:
		logger.Info("Shutdown signal received", zap.String("signal", sig.String()))

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := app.ShutdownWithContext(ctx); err != nil {
			logger.Fatal("Server shutdown failed", zap.Error(err))
		}

		logger.Info("Server stopped successfully")
	}
}
