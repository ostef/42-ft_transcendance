all: backend frontend

frontend:
	@echo "Building frontend..."
	npm install --prefix ./frontend
	npm run dev --prefix ./frontend &
	@echo "Done building frontend"

backend:
	@echo "Building backend..."
	npm install --prefix ./backend
	npm run start:dev --prefix ./backend &
	@echo "Done building backend"

.PHONY: frontend backend