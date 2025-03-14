# Check Mate AI

A web application that processes CSV bank statements and analyzes check images using GPT-4o to extract check numbers and payee names.

## Features

- CSV file upload and processing
- Check image upload and analysis with GPT-4o
- Automatic reason assignment based on predefined rules
- Interactive UI with Material-UI components
- Error handling and progress indicators
- File history management
- Matching rules management

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- OpenAI API key (for GPT-4o integration)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/check-mate-ai.git
   cd check-mate-ai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## Usage

### Processing Bank Statements

1. **Upload CSV**: Start by uploading a CSV file of your bank statement.
2. **Upload Check Images**: Upload images of your checks. The application will use GPT-4o to extract check numbers and payee names.
3. **Confirm Information**: Review and confirm the extracted information.
4. **Download Modified CSV**: Download the processed CSV file with check names and reasons added.

### Managing Files

- View previously processed files
- Download or delete files from history

### Managing Matching Rules

- View and edit rules for categorizing transactions
- Add new rules or delete existing ones

## GPT-4o Integration

The application uses OpenAI's GPT-4o to analyze check images and extract information. To use this feature:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add the key to your `.env` file as `VITE_OPENAI_API_KEY=your_key_here`

If no API key is provided, the application will fall back to a simulation mode.

## Development

### Project Structure

- `src/components/`: UI components
- `src/services/`: Business logic and API integrations
- `src/types/`: TypeScript type definitions
- `src/data/`: Static data like reason mappings

### Building for Production

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Material-UI](https://mui.com/) for the UI components
- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [OpenAI](https://openai.com/) for GPT-4o API
