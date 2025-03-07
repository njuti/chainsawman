// Code generated by gorm.io/gen. DO NOT EDIT.
// Code generated by gorm.io/gen. DO NOT EDIT.
// Code generated by gorm.io/gen. DO NOT EDIT.

package query

import (
	"context"
	"database/sql"

	"gorm.io/gorm"

	"gorm.io/gen"

	"gorm.io/plugin/dbresolver"
)

var (
	Q         = new(Query)
	Algo      *algo
	AlgoParam *algoParam
	Edge      *edge
	EdgeAttr  *edgeAttr
	Exec      *exec
	Graph     *graph
	Group     *group
	Node      *node
	NodeAttr  *nodeAttr
)

func SetDefault(db *gorm.DB, opts ...gen.DOOption) {
	*Q = *Use(db, opts...)
	Algo = &Q.Algo
	AlgoParam = &Q.AlgoParam
	Edge = &Q.Edge
	EdgeAttr = &Q.EdgeAttr
	Exec = &Q.Exec
	Graph = &Q.Graph
	Group = &Q.Group
	Node = &Q.Node
	NodeAttr = &Q.NodeAttr
}

func Use(db *gorm.DB, opts ...gen.DOOption) *Query {
	return &Query{
		db:        db,
		Algo:      newAlgo(db, opts...),
		AlgoParam: newAlgoParam(db, opts...),
		Edge:      newEdge(db, opts...),
		EdgeAttr:  newEdgeAttr(db, opts...),
		Exec:      newExec(db, opts...),
		Graph:     newGraph(db, opts...),
		Group:     newGroup(db, opts...),
		Node:      newNode(db, opts...),
		NodeAttr:  newNodeAttr(db, opts...),
	}
}

type Query struct {
	db *gorm.DB

	Algo      algo
	AlgoParam algoParam
	Edge      edge
	EdgeAttr  edgeAttr
	Exec      exec
	Graph     graph
	Group     group
	Node      node
	NodeAttr  nodeAttr
}

func (q *Query) Available() bool { return q.db != nil }

func (q *Query) clone(db *gorm.DB) *Query {
	return &Query{
		db:        db,
		Algo:      q.Algo.clone(db),
		AlgoParam: q.AlgoParam.clone(db),
		Edge:      q.Edge.clone(db),
		EdgeAttr:  q.EdgeAttr.clone(db),
		Exec:      q.Exec.clone(db),
		Graph:     q.Graph.clone(db),
		Group:     q.Group.clone(db),
		Node:      q.Node.clone(db),
		NodeAttr:  q.NodeAttr.clone(db),
	}
}

func (q *Query) ReadDB() *Query {
	return q.ReplaceDB(q.db.Clauses(dbresolver.Read))
}

func (q *Query) WriteDB() *Query {
	return q.ReplaceDB(q.db.Clauses(dbresolver.Write))
}

func (q *Query) ReplaceDB(db *gorm.DB) *Query {
	return &Query{
		db:        db,
		Algo:      q.Algo.replaceDB(db),
		AlgoParam: q.AlgoParam.replaceDB(db),
		Edge:      q.Edge.replaceDB(db),
		EdgeAttr:  q.EdgeAttr.replaceDB(db),
		Exec:      q.Exec.replaceDB(db),
		Graph:     q.Graph.replaceDB(db),
		Group:     q.Group.replaceDB(db),
		Node:      q.Node.replaceDB(db),
		NodeAttr:  q.NodeAttr.replaceDB(db),
	}
}

type queryCtx struct {
	Algo      IAlgoDo
	AlgoParam IAlgoParamDo
	Edge      IEdgeDo
	EdgeAttr  IEdgeAttrDo
	Exec      IExecDo
	Graph     IGraphDo
	Group     IGroupDo
	Node      INodeDo
	NodeAttr  INodeAttrDo
}

func (q *Query) WithContext(ctx context.Context) *queryCtx {
	return &queryCtx{
		Algo:      q.Algo.WithContext(ctx),
		AlgoParam: q.AlgoParam.WithContext(ctx),
		Edge:      q.Edge.WithContext(ctx),
		EdgeAttr:  q.EdgeAttr.WithContext(ctx),
		Exec:      q.Exec.WithContext(ctx),
		Graph:     q.Graph.WithContext(ctx),
		Group:     q.Group.WithContext(ctx),
		Node:      q.Node.WithContext(ctx),
		NodeAttr:  q.NodeAttr.WithContext(ctx),
	}
}

func (q *Query) Transaction(fc func(tx *Query) error, opts ...*sql.TxOptions) error {
	return q.db.Transaction(func(tx *gorm.DB) error { return fc(q.clone(tx)) }, opts...)
}

func (q *Query) Begin(opts ...*sql.TxOptions) *QueryTx {
	tx := q.db.Begin(opts...)
	return &QueryTx{Query: q.clone(tx), Error: tx.Error}
}

type QueryTx struct {
	*Query
	Error error
}

func (q *QueryTx) Commit() error {
	return q.db.Commit().Error
}

func (q *QueryTx) Rollback() error {
	return q.db.Rollback().Error
}

func (q *QueryTx) SavePoint(name string) error {
	return q.db.SavePoint(name).Error
}

func (q *QueryTx) RollbackTo(name string) error {
	return q.db.RollbackTo(name).Error
}
