package config

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
	"github.com/spf13/viper"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/handler"
	"github.com/yoviarpauzi/coduflow/server/internal/delivery/route"
	"github.com/yoviarpauzi/coduflow/server/internal/domain/service"
	"github.com/yoviarpauzi/coduflow/server/internal/repository"
	"github.com/yoviarpauzi/coduflow/server/internal/usecase"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type BootstrapConfig struct {
	App         *fiber.App
	DB          *mongo.Database
	Validate    *validator.Validate
	Config      *viper.Viper
	PasetoToken service.PasetoService
}

func Bootstrap(config *BootstrapConfig) {
	taskRepository := repository.NewTaskRepository(config.DB)

	taskUseCase := usecase.NewTaskUseCase(taskRepository)

	taskHandler := handler.NewTaskHandler(config.Validate, taskUseCase)

	routeConfig := &route.RouteConfig{
		App:         config.App,
		TaskHandler: taskHandler,
	}

	routeConfig.Setup()
}
