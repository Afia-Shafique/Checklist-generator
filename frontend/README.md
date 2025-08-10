# Construction Document Parser Frontend

This is the frontend application for the Construction Document Parser project. It provides a user interface for uploading construction documents, processing them with OCR, and matching the extracted specifications with Saudi Building Code (SBC) requirements.

## Features

- Document upload and processing
- Selection of relevant SBC codebooks for matching
- Visualization of matched results between user specifications and SBC codes
- Filtering and searching through matched results
- Export of results to JSON format

## Tech Stack

- React.js
- Material-UI for component library
- React Router for navigation
- Axios for API communication

## Color Scheme

The application uses the following color scheme:

- Primary: `#016e4f` (Dark Green)
- Secondary: `#ffa725` (Orange)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the Development Server

```
npm start
```
or
```
yarn start
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Building for Production

```
npm run build
```
or
```
yarn build
```

This will create a production-ready build in the `build` directory.

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Page components for different routes
├── services/         # API services and utilities
├── App.js            # Main application component
├── index.js          # Application entry point
├── theme.js          # Material-UI theme configuration
└── index.css         # Global styles
```

## API Integration

The frontend communicates with the backend API for document processing and code matching. The API endpoints used are:

- `/api/upload` - For uploading and processing documents

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

## License

This project is licensed under the MIT License.