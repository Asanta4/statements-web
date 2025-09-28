# Google Sign-In Setup Instructions

This guide walks you through setting up Google OAuth for the Check Mate AI application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project name: `check-mate-ai` (or your preferred name)
5. Click "Create"

## Step 2: Enable Google Identity Services

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity API"
3. Enable the API (this may already be enabled by default)

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "Internal" (for organization use) or "External" (for public use)
3. Fill in the required information:
   - **App name**: Check Mate AI
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. Skip "Scopes" step (click "Save and Continue")
6. Skip "Test users" step if using Internal, or add test users if using External
7. Click "Back to Dashboard"

## Step 4: Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Configure:
   - **Name**: Check Mate AI Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for Vite dev server)
     - `http://localhost:3000` (alternative dev port)
     - Your production domain (if deploying)
   - **Authorized redirect URIs**: (Leave empty for now)
5. Click "Create"
6. Copy the **Client ID** (you'll need this for environment variables)

## Step 5: Environment Variables Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholder values:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_ALLOWED_EMAILS=user1@gmail.com,user2@example.com
   ```

3. Replace `your_google_client_id_here` with the Client ID from step 4
4. Update `VITE_ALLOWED_EMAILS` with comma-separated email addresses that should have access
5. Save the file

## Step 6: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:5173](http://localhost:5173)
3. You should see the Google Sign-In screen
4. Click "Sign in with Google"
5. Authorize the application
6. If your email is in the allowed list, you'll be authenticated

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure `http://localhost:5173` is added to "Authorized JavaScript origins" in Google Cloud Console
- Check that you're accessing the app from the correct URL

### "This app isn't verified"
- This is normal for development. Click "Advanced" > "Go to Check Mate AI (unsafe)"
- For production, you'll need to verify your app with Google

### "Your email is not authorized"
- Check that your email is included in the `VITE_ALLOWED_EMAILS` environment variable
- Emails are case-insensitive but must match exactly
- Make sure there are no extra spaces in the email list

### "Google Client ID not configured"
- Verify that `VITE_GOOGLE_CLIENT_ID` is set in your `.env` file
- Restart the development server after changing environment variables

## Security Notes

- Never commit your `.env` file to version control
- The Client Secret is not needed for client-side authentication
- Regularly review and rotate your API keys
- Only add trusted domains to authorized origins

## Production Deployment

When deploying to production:

1. Add your production domain to "Authorized JavaScript origins"
2. Update environment variables on your hosting platform
3. Consider getting your app verified by Google for public use
4. Use HTTPS for all production deployments