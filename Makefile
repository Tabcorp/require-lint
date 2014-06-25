
test: test-js test-coffee

test-js: node_modules
	@echo "\n- Checking dependencies in JS\n"
	-@node ./bin/cmd.js --pkg test/package.json --entry test/js/test.js
	@echo

test-coffee: node_modules
	@echo "\n- Checking dependencies in CoffeeScript\n"
	-@node ./bin/cmd.js --pkg test/package.json --entry test/coffee/test.coffee --require coffee-script/register
	@echo

node_modules: package.json
	npm install

.PHONY: test test-js test-coffee
