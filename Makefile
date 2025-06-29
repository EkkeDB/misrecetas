# Makefile for Family Recipes & Stretches App
# Simplifies common Docker Compose operations for the fullstack project

.PHONY: build up down logs shell-backend migrate createsuperuser frontend help clean restart status

# Default target
help:
	@echo "Family Recipes & Stretches App - Available Commands:"
	@echo ""
	@echo "  make build          - Build all Docker containers"
	@echo "  make up             - Start all services in the background"
	@echo "  make down           - Stop all containers and remove volumes/networks"
	@echo "  make logs           - View combined logs from all services"
	@echo "  make shell-backend  - Enter the Django backend container shell"
	@echo "  make migrate        - Run Django migrations"
	@echo "  make createsuperuser - Create Django superuser"
	@echo "  make frontend       - Run Next.js dev server (interactive)"
	@echo "  make restart        - Restart all services"
	@echo "  make status         - Show status of all containers"
	@echo "  make clean          - Remove all containers, images, and volumes"
	@echo ""
	@echo "Quick Start:"
	@echo "  1. make build"
	@echo "  2. make up"
	@echo "  3. make migrate"
	@echo "  4. make createsuperuser"
	@echo "  5. Open http://localhost:3000"

# Build all Docker containers
build:
	@echo "Building all Docker containers..."
	docker-compose build

# Start all services in the background
up:
	@echo "Starting all services in the background..."
	docker-compose up -d
	@echo "Services started! Frontend: http://localhost:3000, Backend: http://localhost:8000"

# Stop all containers and remove volumes/networks
down:
	@echo "Stopping all containers and removing volumes/networks..."
	docker-compose down -v --remove-orphans

# View combined logs from all services
logs:
	@echo "Showing logs from all services (Ctrl+C to exit)..."
	docker-compose logs -f

# Enter the Django backend container shell
shell-backend:
	@echo "Entering Django backend container shell..."
	docker-compose exec backend /bin/bash

# Run Django migrations
migrate:
	@echo "Running Django migrations..."
	docker-compose exec backend python manage.py migrate

# Create Django superuser
createsuperuser:
	@echo "Creating Django superuser..."
	docker-compose exec backend python manage.py createsuperuser

# Run Next.js development server (interactive)
frontend:
	@echo "Starting Next.js development server (interactive mode)..."
	@echo "This will attach to the frontend container. Use Ctrl+C to exit."
	docker-compose exec frontend npm run dev

# Restart all services
restart:
	@echo "Restarting all services..."
	docker-compose restart

# Show status of all containers
status:
	@echo "Container status:"
	docker-compose ps

# Clean up everything (containers, images, volumes)
clean:
	@echo "WARNING: This will remove ALL containers, images, and volumes!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read
	docker-compose down -v --remove-orphans
	docker system prune -a --volumes -f
	@echo "Cleanup complete!"

# Additional useful targets

# View logs for specific service
logs-frontend:
	@echo "Showing frontend logs..."
	docker-compose logs -f frontend

logs-backend:
	@echo "Showing backend logs..."
	docker-compose logs -f backend

logs-db:
	@echo "Showing database logs..."
	docker-compose logs -f db

# Django management commands
shell-django:
	@echo "Entering Django shell..."
	docker-compose exec backend python manage.py shell

collectstatic:
	@echo "Collecting static files..."
	docker-compose exec backend python manage.py collectstatic --noinput

# Database operations
db-shell:
	@echo "Entering PostgreSQL shell..."
	docker-compose exec db psql -U postgres -d recipe_app

db-backup:
	@echo "Creating database backup..."
	docker-compose exec db pg_dump -U postgres recipe_app > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created: backup_$(shell date +%Y%m%d_%H%M%S).sql"

# Development helpers
install-frontend:
	@echo "Installing frontend dependencies..."
	docker-compose exec frontend npm install

install-backend:
	@echo "Installing backend dependencies..."
	docker-compose exec backend pip install -r requirements.txt

# Test commands
test-backend:
	@echo "Running Django tests..."
	docker-compose exec backend python manage.py test

test-frontend:
	@echo "Running frontend tests..."
	docker-compose exec frontend npm test

# Linting and formatting
lint-frontend:
	@echo "Linting frontend code..."
	docker-compose exec frontend npm run lint

# Production build
build-prod:
	@echo "Building for production..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Quick development setup
dev-setup: build up migrate
	@echo "Development setup complete!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"
	@echo "Admin: http://localhost:8000/admin"
	@echo ""
	@echo "Next steps:"
	@echo "  make createsuperuser  - Create admin user"
	@echo "  make logs            - View application logs"