FROM mongo:latest

COPY ./init-mongo.js /docker-entrypoint-initdb.d/

ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=password
ENV MONGO_INITDB_DATABASE=star_reward_app

EXPOSE 27017

CMD ["mongod", "--bind_ip_all"] 