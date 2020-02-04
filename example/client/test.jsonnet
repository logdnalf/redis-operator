local k = import "ksonnet.beta.4/k.libsonnet";
local container = k.extensions.v1beta1.deployment.mixin.spec.template.spec.containersType;
local deployment = k.extensions.v1beta1.deployment;

local podLabels = {
  app: "redis-test"
};
local redisTest =
  container.new("redis-test", "falfaro/redis_test:latest") +
  container.withImagePullPolicy('Always');
local redisTestDeployment = deployment.new("redis-test", 3, redisTest, podLabels) +
  deployment.mixin.spec.template.spec.securityContext.withRunAsUser(1000) +
  deployment.mixin.spec.template.spec.securityContext.withRunAsGroup(1000) +
  deployment.mixin.spec.template.spec.securityContext.withFsGroup(1000) +
  deployment.mixin.spec.template.spec.withTerminationGracePeriodSeconds(10);

k.core.v1.list.new(redisTestDeployment)