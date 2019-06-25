-include ../../node_modules/@financial-times/rel-engage/index.mk

# TODO move to a localised name for this (requires vault update)
PROJECT_NAME=biz-ops-runbook-md
PRODUCT_NAME=biz-ops

serverless-offline:
	serverless offline --stage test start

deploy: build-statics move-asset-manifest upload-statics deploy-aws

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
		then serverless webpack; \
		else serverless webpack --mode production; \
	fi

build-statics:
	@if [ -z $(CI) ]; \
		then webpack-dev-server --config webpack.browser.config.js --mode development; \
		else webpack --config webpack.browser.config.js --mode production; \
	fi

run: clean
	@concurrently "make build-statics" "make serverless-offline"

move-asset-manifest:
	[ -f "./dist/browser/manifest.json" ] && mv "./dist/browser/manifest.json" ./src/assets/
