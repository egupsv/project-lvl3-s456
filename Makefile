make testinstall: 
	npm install

build:
	rm -rf dist
	npm run build

test:
	npm test

publish:
	npm publish --dry-run

lint:
	npx eslint .

