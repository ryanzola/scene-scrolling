.PHONY: up down build clean

build:
	docker build -t template-complex -f Dockerfile .

up: build
	docker run --rm --name template-complex \
		-p 3000:3000 \
		-v ${PWD}:/app \
		-v /app/node_modules \
		template-complex

down:
	docker stop template-complex
	rm -rf ./node_modules

clean:
	docker rmi template-complex

