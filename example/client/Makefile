test.yaml: test.jsonnet
	jsonnet -J vendor/ test.jsonnet > test.yaml

apply: test.yaml
	kubectl apply -f test.yaml

delete: test.yaml
	kubectl delete -f test.yaml

logs: apply
	kubectl logs -f -l app=redis-test

image: Dockerfile
	docker build -t falfaro/redis_test .

push: Dockerfile
	docker push falfaro/redis_test
