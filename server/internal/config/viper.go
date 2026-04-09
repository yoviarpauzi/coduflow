package config

import (
	"log"
	"strings"

	"github.com/spf13/viper"
	"go.uber.org/zap"
)

func NewViper() *viper.Viper {
	config := viper.New()
	config.SetConfigName("config")
	config.SetConfigType("yaml")
	config.AddConfigPath(".")
	config.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	config.AutomaticEnv()

	if err := config.ReadInConfig(); err != nil {
		log.Fatal("No configuration file found, relying on environment variables", zap.Error(err))
	}

	return config
}
