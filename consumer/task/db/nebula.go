package db

import (
	"chainsawman/common"
	"chainsawman/consumer/task/model"
	"chainsawman/consumer/task/types"
)

type NebulaClient interface {
	CreateGraph(graph int64, group *model.Group) error

	HasGraph(graph int64) (bool, error)

	InsertNode(graph int64, node *model.Node, record *common.Record) (int, error)

	MultiInsertNodes(graph int64, node *model.Node, records []*common.Record) (int, error)

	InsertEdge(graph int64, edge *model.Edge, record *common.Record) (int, error)

	MultiInsertEdges(graph int64, edge *model.Edge, records []*common.Record) (int, error)

	GetNodesByIds(graph int64, ids []int64) (map[string][]*types.Node, error)

	GetTopNodes(graph int64, top int64) (map[string][]*types.Node, error)

	Go(graph int64, src int64, direction string, max int64) (map[string][]*types.Edge, error)

	MultiGo(graph int64, srcList []int64, direction string, max int64) (map[string][]*types.Edge, error)

	GoFromTopNodes(graph int64, top int64, direction string, max int64) (map[string][]*types.Edge, error)

	DropGraph(graph int64) error

	MultiIncNodesDeg(graph int64, degMap map[int64]int64) (int, error)

	// GetLibraryIDsByNames 根据名称查询库的ID
	GetLibraryIDsByNames(graph int64, names []string) (map[string]int64, error)

	// GetReleaseIDsByNames 根据名称查询发行版本的ID
	GetReleaseIDsByNames(graph int64, names []string) (map[string]int64, error)

	// GetMaxLibraryID 获取库的最大ID
	GetMaxLibraryID(graph int64) (int64, error)

	// GetMaxReleaseID 获取发行版本的最大ID
	GetMaxReleaseID(graph int64) (int64, error)
}
