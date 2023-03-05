db_install:
	docker pull cr.yandex/yc/yandex-docker-local-ydb:latest

db_run:
	docker run -d --rm --name ydb-local -h localhost \
  -p 2135:2135 -p 8765:8765 -p 2136:2136 \
  -v $(pwd)/ydb_certs:/ydb_certs -v $(pwd)/ydb_data:/ydb_data \
  -e YDB_DEFAULT_LOG_LEVEL=NOTICE \
  -e GRPC_TLS_PORT=2135 -e GRPC_PORT=2136 -e MON_PORT=8765 \
  cr.yandex/yc/yandex-docker-local-ydb:latest

db_drop:
	docker kill ydb-local