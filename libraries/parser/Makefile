-include ../../Makefile

PROJECT_NAME=biz-ops-runbook-md-parser
PRODUCT_NAME=biz-ops

test:
ifneq ($(CI),)
	jest test
else
	jest test --watch
endif
