# Offshore Rapport v6 Email Content Workflow

This document explains how to use the email-based content workflow for the Offshore Rapport v6 system. This workflow allows you to generate high-quality content using ChatGPT and import it into the system.

## Overview

The workflow consists of these steps:

1. Generate content using ChatGPT with specific instructions
2. Save the generated content to a file
3. Import the content into the Offshore Rapport system
4. Publish the content (optional)

## Step 1: Generate Content with ChatGPT

1. Access the ChatGPT system instructions from:
   ```
   /server/data/instructions/chatgpt-content-prompt.md
   ```

2. Copy the entire content of this file and use it as a system prompt in ChatGPT.

3. Ask ChatGPT to generate either:
   - Fisheries content
   - Offshore economics content

4. Example user prompts:
   ```
   Generate a comprehensive fisheries industry report focusing on sustainable aquaculture practices in the North Atlantic region.
   ```
   
   ```
   Create an offshore economic analysis of wind energy investment trends in Europe for Q2 2025.
   ```

5. Copy the generated content and save it to a text file with a `.md` extension.

## Step 2: Import the Content

Use the import script to process the content file:

```bash
# Navigate to the project directory
cd /path/to/offshore-rapport-v6/server

# Process the content file
node scripts/import-email-content.js --process-file /path/to/content-file.md
```

The script will:
- Parse the content
- Identify the content type (fisheries or offshore economics)
- Extract the title and metadata
- Save the content to the drafts folder
- Generate appropriate metadata

## Step 3: Publish the Content (Optional)

After importing, you can publish the content using the admin interface or the API:

```bash
# Using the API
curl -X POST http://localhost:3000/api/admin/content/[CONTENT_ID]/publish
```

## Advanced: Email Integration

For a full email workflow:

1. Install the nodemailer package:
   ```bash
   npm install nodemailer
   ```

2. Configure your email settings in the script:
   ```javascript
   // In /server/scripts/import-email-content.js
   const config = {
     email: {
       user: 'your-email@example.com',
       password: 'your-password',
       host: 'your-smtp-server.com',
       port: 587,
       tls: true
     },
     // ... other config
   };
   ```

3. Send the instructions to your email:
   ```bash
   node scripts/import-email-content.js --send-instructions your-email@example.com
   ```

4. Follow the instructions in the email to generate content with ChatGPT.

5. Reply to the email with the generated content.

6. Set up an IMAP connection to automatically process incoming emails (future enhancement).

## Notes on Content Quality

- ChatGPT generates high-quality, structured content following the specific templates
- The content is designed to match the format and style of the existing system
- Custom formatting includes tables, lists, and proper markdown structure
- Data points are realistic but generated (in a production system, you'd want to verify facts)

## Scheduled Tasks

The system already has scheduled tasks for automatic content generation:

- Weekly Offshore Economic Analysis (Wednesdays at 8:00 AM)
- Weekly Fisheries Industry Report (Fridays at 9:00 AM)

You can manually trigger these tasks from the admin interface or use the email workflow as an alternative content source.

## Troubleshooting

- **Parsing Error**: Make sure the content follows the exact format specified in the instructions
- **Category Not Detected**: Check that the content includes the proper category header
- **Import Failure**: Verify the file path and make sure the file is accessible
- **Email Sending Failure**: Check your SMTP settings and credentials

## Future Enhancements

- Automatic email fetching and processing
- Web form for content submission
- Integration with additional AI models
- Quality verification and fact-checking workflow
- Multi-user collaboration on content generation

---

This workflow provides a flexible way to incorporate AI-generated content into the Offshore Rapport system while maintaining control over the content quality and publication process.