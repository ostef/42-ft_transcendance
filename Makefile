DOCKER = docker
COMPOSE = $(DOCKER) compose -p ft_transcendance -f docker-compose.yml
DATA_VOLUME = ./data
DEPENDENCIES = $(DATA_VOLUME)

all: up

$(DATA_VOLUME):
	mkdir -p $(DATA_VOLUME)

ps:
	$(COMPOSE) ps

images:
	$(COMPOSE) images

volumes:
	$(DOCKER) volume ls

networks:
	$(DOCKER) network ls

start: $(DEPENDENCIES)
	$(COMPOSE) start

stop:
	$(COMPOSE) stop

restart: $(DEPENDENCIES)
	$(COMPOSE) restart

up: $(DEPENDENCIES)
	$(COMPOSE) up --detach --build

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down --rmi all --volumes

fclean: clean
	$(RM) -r $(DATA_VOLUME)/*

prune: down fclean
	$(DOCKER) system prune -a -f

log:
	$(DOCKER) logs server > server.log 2>> server.log

re: fclean all

.PHONY: all ps images volumes networks start stop restart up down clean fclean prune re
