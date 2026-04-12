package config

import (
	"context"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
	"github.com/spf13/viper"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/handler"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/route"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/service"
	"github.com/yoviarpauzi/coduflow/server/internal/repository"
	"github.com/yoviarpauzi/coduflow/server/internal/usecase"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
)

type BootstrapConfig struct {
	App         *fiber.App
	DB          *mongo.Database
	Validate    *validator.Validate
	Config      *viper.Viper
	Log         *zap.Logger
	PasetoToken service.PasetoService
	RedisStore  fiber.Storage
}

func Bootstrap(config *BootstrapConfig) {
	indexCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := repository.CreateIndexes(indexCtx, config.DB); err != nil {
		config.Log.Fatal("failed to create mongo indexes", zap.Error(err))
	}

	taskRepository := repository.NewTaskRepository(config.DB)
	taskStatusRepository := repository.NewTaskStatusRepository(config.DB)

	taskUseCase := usecase.NewTaskUseCase(taskRepository, config.Log)
	taskStatusUseCase := usecase.NewTaskStatusUseCase(taskStatusRepository)

	taskHandler := handler.NewTaskHandler(config.Validate, taskUseCase)
	taskStatusHandler := handler.NewTaskStatusHandler(config.Validate, taskStatusUseCase)

	routeConfig := &route.RouteConfig{
		App:               config.App,
		TaskHandler:       taskHandler,
		TaskStatusHandler: taskStatusHandler,
		RedisStore:        config.RedisStore,
	}

	routeConfig.Setup()
}
