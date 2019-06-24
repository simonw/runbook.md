-include ../../node_modules/@financial-times/rel-engage/index.mk

# TODO move to a localised name for this (requires vault update)
PROJECT_NAME=biz-ops-runbook-md
PRODUCT_NAME=biz-ops

serverless-offline:
	serverless offline --stage test start

deploy: transpile build-statics upload-statics deploy-aws

upload-statics:
	aws s3 sync \
	--cache-control=public,max-age=31536000,immutable \
	--exclude "*.json" \
	./dist/browser s3://biz-ops-statics.${AWS_ACCOUNT_ID}/biz-ops-runbook-md

deploy-aws:
	serverless deploy --stage ${ENVIRONMENT}

clean:
	rm -rf dist/

transpile:
	@if [ -z $(CI) ]; \
		then babel -w src -d dist --ignore src/browser/**/*; \
		else babel src -d dist --ignore src/browser/**/*; \
	fi

build-statics:
	@if [ -z $(CI) ]; \
		then webpack-dev-server --mode development; \
		else webpack --mode production; \
	fi

run: clean
	@concurrently "make build-statics" "make transpile" "make serverless-offline"
