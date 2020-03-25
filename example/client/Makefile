bootstrap:
	brew install jsonnet sshuttle kubernetes-cli

test.yaml: test.jsonnet
	jsonnet -J vendor/ test.jsonnet > test.yaml

apply: test.yaml
	kubectl -n felipe apply -f test.yaml

delete: test.yaml
	kubectl -n felipe delete -f test.yaml

logs: apply
	kubectl -n felipe wait --for=condition=available --timeout=600s deployment/redis-test
	kubectl -n felipe logs -f -l app=redis-test

image: Dockerfile
	docker build -t falfaro/redis_test .

push: image
	docker push falfaro/redis_test
