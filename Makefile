# ---------------------------
# Generated by rel-engage

# This task tells make how to 'build' n-gage. It npm installs n-gage, and
# Once that's done it overwrites the file with its own contents - this
# ensures the timestamp on the file is recent, so make won't think the file
# is out of date and try to rebuild it every time
node_modules/@financial-times/rel-engage/index.mk:
	@echo "Updating rel-engage"
	@npm install --save-dev @financial-times/rel-engage
	@touch $@

# If, by the end of parsing your `Makefile`, `make` finds that any files
# referenced with `-include` don't exist or are out of date, it will run any
# tasks it finds that match the missing file. So if n-gage *is* installed
# it will just be included; if not, it will look for a task to run
-include node_modules/@financial-times/rel-engage/index.mk

verify:

install:

# End generated by rel-engage
# ---------------------------

PROJECT_NAME=biz-ops-runbook-md
PRODUCT_NAME=biz-ops

test:
ifneq ($(CI),)
	jest
else
	jest --watchAll
endif

serverless-offline:
	serverless offline --stage test start

deploy: build-statics move-asset-manifest upload-statics deploy-aws

package:
	serverless package

upload-statics:
	aws s3 sync \
	--cache-control=public,max-age=31536000,immutable \
	--exclude "*.json" \
	./dist/browser s3://biz-ops-statics.${AWS_ACCOUNT_ID}/biz-ops-runbook-md

deploy-aws:
	serverless deploy --stage ${ENVIRONMENT} --verbose

clean:
	rm -rf dist/

transpile:
	@if [ -z $(CI) ]; \
		then serverless webpack; \
		else serverless webpack --mode production; \
	fi

build-production-assets:
	webpack --config webpack.browser.config.js --mode production;

build-statics:
	@if [ -z $(CI) ]; \
		then webpack-dev-server --config webpack.browser.config.js --mode development; \
		else make build-production-assets; \
	fi

run: clean
	@concurrently "make build-statics" "make serverless-offline"

move-asset-manifest:
	[ -f "./dist/browser/manifest.json" ] && mv "./dist/browser/manifest.json" ./lambdas/ingester/src/assets/
