package mq

import (
	"chainsawman/graph/model"

	"context"
)

type TaskMq interface {
	ProduceTaskMsg(ctx context.Context, task *model.KVTask) (string, error)

	DelTaskMsg(ctx context.Context, task *model.KVTask) error

	ScheduleTask(ctx context.Context, task *model.KVTask, cron string) (string, error)
}
