test.yaml: test.jsonnet
	jsonnet -J vendor/ test.jsonnet > test.yaml

apply: test.yaml
	kubectl apply -f test.yaml

delete: test.yaml
	kubectl delete -f test.yaml

logs: apply
	kubectl wait --for=condition=available --timeout=600s deployment/redis-test
	kubectl logs -f -l app=redis-test

image:
	docker build -t falfaro/redis_test_python .

push: image
	docker push falfaro/redis_test_python
