package config

import (
	"context"
	"time"

	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
	"go.uber.org/zap"
)

func NewMongoClient(config *viper.Viper, log *zap.Logger) *mongo.Client {
	uri := config.GetString("DB_URI")
	if uri == "" {
		log.Fatal("DB_URI is not set in configuration")
	}

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB", zap.Error(err))
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatal("MongoDB is unreachable", zap.Error(err))
	}

	log.Info("Connected to MongoDB")

	return client
}
