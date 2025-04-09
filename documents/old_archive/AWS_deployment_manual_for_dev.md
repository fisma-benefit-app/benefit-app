# Manual: How and why to deploy dev-project to AWS. 

## 1. Introductions

### 1.1 Why choosing AWS over other cloud solutions like Azure, Google Cloud, etc.?
We determined that AWS is sufficient enough for deploying for our project
in reasonable price (i.e. in range of student budget). Also some features and their 
functionality in AWS are to some degree better and, most importantly, _self-explanatory_
than previously mentioned cloud platforms.

### 1.2 What solution for deployment did you choose and why?
According to several sources, we chose **ECS + Fargate** as
primary solution for deploying our project. Igor Mardari
brough up several important points why choose ECS + Fargate over
e.g. Beanstalk, the first and most basic deployment solution.

Most noteable points are the lack of Github integration and 
CI/CD limitations in Beanstalk. These features are one of most vital
objects for our project. Thus, Beanstalk isn't sufficient at all.

Another important point is the very restricted support of docker in Beanstalk.
Even ECS and EC2 has a ongoing challenge of continously maintaining dockers,
according to Ubertas Consulting. Hence, the serverless Fargate is beneficial 
for project, that contains docker composes.

Sources:

https://medium.com/7code/why-i-prefer-aws-ecs-over-beanstalk-a-personal-perspective-55b3ebc444e1
https://ubertasconsulting.com/modernising-in-aws-elastic-beanstalk-to-fargate/

### 1.3 What sources did you use for deployment?
As any professional developer knows, the most essential tool for doing any coding and infrastructure
solution is reading the official documentation by the company, specifically about certain 
topic or problem.

Hence, we used official AWS documentation about Amazon Elastic Container Service as
one of primary sources:
https://docs.aws.amazon.com/ecs/?icmpid=docs_homepage_containers




