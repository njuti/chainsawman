package handler

import (
	"net/http"

	"chainsawman/graph/cmd/api/internal/logic"
	"chainsawman/graph/cmd/api/internal/svc"
	"chainsawman/graph/cmd/api/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func dropGraphHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.DropGraphRequest
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewDropGraphLogic(r.Context(), svcCtx)
		resp, err := l.DropGraph(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
