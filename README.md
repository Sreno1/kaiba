# Kaiba - Todo App

A modern todo application built with Laravel, React, Tailwind CSS, shadcn/ui, and Kibo-UI components.

## Features

- **Todo Management**: Create, read, update, and delete todos
- **Priority System**: Set priority levels (low, medium, high) for todos
- **Tag System**: Organize todos with customizable colored tags
- **Due Dates**: Set due dates for todos
- **Completion Tracking**: Mark todos as complete/incomplete
- **Modern UI**: Beautiful interface using Tailwind CSS and shadcn/ui components
- **Enhanced Components**: Utilizes Kibo-UI for advanced components
- **Authentication**: User registration and login system
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Backend**: Laravel 12.x
- **Frontend**: React 18+ with Inertia.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Kibo-UI
- **Database**: SQLite (default) or MySQL/PostgreSQL
- **Authentication**: Laravel Breeze with React

## Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url] kaiba
   cd kaiba
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Set up database**
   ```bash
   php artisan migrate
   php artisan db:seed --class=TagSeeder
   ```

6. **Build assets**
   ```bash
   npm run build
   ```

7. **Start the development server**
   ```bash
   php artisan serve
   ```

   Visit `http://localhost:8000` in your browser.

## Usage

1. **Register/Login**: Create an account or login
2. **Create Tags**: Go to the Todos page and create custom tags for organization
3. **Add Todos**: Click "New Todo" to create your first todo item
4. **Manage Todos**: Edit, complete, or delete todos as needed
5. **Organize**: Use tags and priorities to keep your todos organized

## API Endpoints

The application provides RESTful API endpoints for todos and tags:

- `GET /api/todos` - List all todos for authenticated user
- `POST /api/todos` - Create a new todo
- `GET /api/todos/{id}` - Get a specific todo
- `PUT /api/todos/{id}` - Update a todo
- `DELETE /api/todos/{id}` - Delete a todo
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create a new tag
- `PUT /api/tags/{id}` - Update a tag
- `DELETE /api/tags/{id}` - Delete a tag

## Development

To run the application in development mode:

```bash
# Start the Laravel development server
php artisan serve

# In a separate terminal, run Vite for hot reloading
npm run dev
```

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
