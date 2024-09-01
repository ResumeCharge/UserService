
nest build
sudo docker build -t user-service .

sudo docker image tag user-service adalaws/user-service:latest

sudo docker image push adalaws/user-service:latest
