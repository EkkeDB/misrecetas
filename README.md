# Family Recipes & Stretches App

A complete fullstack web application for managing family recipes and stretching routines. Built with Next.js, Django, and PostgreSQL, containerized with Docker.

## 🚀 Features

### 🔐 Authentication
- Secure JWT authentication with HttpOnly cookies
- User registration, login, and logout
- Session persistence across frontend and backend

### 🍲 Recipe Management
- Create, read, update, and delete recipes
- Photo gallery with carousel support
- Categories and tags for organization
- Shopping list generation from selected recipes
- Favorite recipes marking
- Search and filter capabilities

### 🧘 Stretching Routines
- Manage stretches organized by body parts
- Difficulty levels (beginner, intermediate, advanced)
- Video link support (YouTube, etc.)
- Custom stretch routines
- Duration and repetition tracking
- Photo support for demonstrations

### 📱 Mobile & PWA
- Responsive design optimized for mobile
- PWA support for app-like experience
- Modern, clean interface inspired by cooking sites

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Django 4.2, Django REST Framework
- **Database**: PostgreSQL 15
- **Authentication**: JWT with HttpOnly cookies
- **Containerization**: Docker & Docker Compose
- **Image Handling**: Django file uploads with Pillow

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd family-recipes-app
```

### 2. Environment Setup
Create a `.env` file in the project root:
```env
# Backend Environment
DEBUG=1
SECRET_KEY=your-super-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:postgres@db:5432/recipe_app
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# Database
DB_NAME=recipe_app
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Build and Run with Docker
```bash
# Build and start all services
docker-compose up --build

# Or run in the background
docker-compose up -d --build
```

### 4. Initialize the Database
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create a superuser (optional, for Django admin)
docker-compose exec backend python manage.py createsuperuser

# Load initial data (optional)
docker-compose exec backend python manage.py loaddata initial_data.json
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## 📁 Project Structure

```
family-recipes-app/
├── backend/                 # Django backend
│   ├── recipe_project/      # Main Django project
│   ├── recipes/             # Recipes app
│   ├── stretches/           # Stretches app
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Backend container config
├── frontend/                # Next.js frontend
│   ├── app/                 # Next.js app directory
│   ├── components/          # Reusable components
│   ├── contexts/            # React contexts
│   ├── lib/                 # Utilities and API client
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies
│   └── Dockerfile          # Frontend container config
├── docker-compose.yml       # Docker services configuration
└── README.md               # This file
```

## 🔧 Development

### Running Without Docker (Development)

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
export DEBUG=1
export SECRET_KEY=your-secret-key
export DATABASE_URL=postgresql://user:password@localhost:5432/recipe_app

# Run migrations and start server
python manage.py migrate
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f

# Access backend shell
docker-compose exec backend python manage.py shell

# Access database
docker-compose exec db psql -U postgres -d recipe_app

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/user/` - Get current user profile

### Recipes
- `GET /api/recipes/` - List recipes
- `POST /api/recipes/` - Create recipe
- `GET /api/recipes/{id}/` - Get recipe details
- `PUT /api/recipes/{id}/` - Update recipe
- `DELETE /api/recipes/{id}/` - Delete recipe
- `POST /api/recipes/images/` - Upload recipe image
- `POST /api/recipes/shopping-list/` - Generate shopping list

### Stretches
- `GET /api/stretches/` - List stretches
- `POST /api/stretches/` - Create stretch
- `GET /api/stretches/{id}/` - Get stretch details
- `PUT /api/stretches/{id}/` - Update stretch
- `DELETE /api/stretches/{id}/` - Delete stretch
- `GET /api/stretches/body-parts/` - List body parts
- `GET /api/stretches/routines/` - List routines

## 🎨 Customization

### Adding New Categories/Body Parts
You can add new categories and body parts through:
1. Django admin interface (http://localhost:8000/admin)
2. API endpoints
3. Database seeding

### Styling
The app uses Tailwind CSS for styling. Key files:
- `frontend/tailwind.config.ts` - Tailwind configuration
- `frontend/app/globals.css` - Global styles and custom components

### Environment Variables
Key environment variables you might want to customize:

- `SECRET_KEY` - Django secret key (change in production)
- `DEBUG` - Django debug mode (set to 0 in production)
- `ALLOWED_HOSTS` - Allowed hosts for Django
- `NEXT_PUBLIC_API_URL` - API URL for frontend

## 🚀 Production Deployment

### Security Considerations
1. Change `SECRET_KEY` to a secure random string
2. Set `DEBUG=0` in production
3. Configure `ALLOWED_HOSTS` properly
4. Use HTTPS and set secure cookie flags
5. Set up proper CORS settings
6. Use environment variables for sensitive data

### Database
- Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Set up regular backups
- Configure connection pooling

### File Storage
- For production, use cloud storage (AWS S3, Google Cloud Storage)
- Configure Django to use cloud storage for media files

### Example Production Environment
```env
DEBUG=0
SECRET_KEY=your-super-secure-production-key
DATABASE_URL=postgresql://user:password@your-db-host:5432/recipe_app
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is for personal use. Modify as needed for your requirements.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 3000 or 8000 are in use, modify `docker-compose.yml`
2. **Database connection issues**: Ensure PostgreSQL container is running
3. **Permission issues**: Check file permissions for mounted volumes
4. **Build failures**: Clear Docker cache with `docker system prune`

### Getting Help

Check the logs:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

## 🎯 Next Steps

This app provides a solid foundation. Consider adding:
- Recipe sharing between users
- Meal planning features
- Nutrition information
- Workout routine creation
- Mobile app with React Native
- Advanced search with Elasticsearch
- Recipe rating and reviews
- Ingredient substitution suggestions

---

**Enjoy cooking and stretching! 🍳🧘‍♀️**