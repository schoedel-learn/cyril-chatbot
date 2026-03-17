import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response, NextFunction } from 'express';
import {join} from 'node:path';
import sgMail from '@sendgrid/mail';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

app.get('/health', (req: Request, res: Response) => res.send('OK'));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[Server] ${req.method} ${req.url} - Host: ${req.headers.host}`);
  next();
});

const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 */

app.post('/api/send-profile', express.json(), async (req, res) => {
  const { email, firstName, lastName, parishName, phone, diocese, otherDiocese } = req.body;
  
  const sendgridKey = process.env['SENDGRID_API_KEY'];
  if (!sendgridKey) {
    console.error('SENDGRID_API_KEY is not set');
    res.status(500).json({ error: 'Email service not configured' });
    return;
  }

  sgMail.setApiKey(sendgridKey);

  const displayDiocese = diocese === 'Other' ? otherDiocese : diocese;
  
  const msg = {
    to: 'barry@catholic.work',
    from: 'barry@catholic.work', // Must be a verified sender in SendGrid
    subject: `New OCIA Assistant User Profile: ${firstName} ${lastName}`,
    text: `
      New User Profile Completed:
      
      Name: ${firstName} ${lastName}
      Email: ${email}
      Parish: ${parishName}
      Phone: ${phone || 'Not provided'}
      Diocese: ${displayDiocese}
    `,
    html: `
      <h3>New User Profile Completed</h3>
      <ul>
        <li><strong>Name:</strong> ${firstName} ${lastName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Parish:</strong> ${parishName}</li>
        <li><strong>Phone:</strong> ${phone || 'Not provided'}</li>
        <li><strong>Diocese:</strong> ${displayDiocese}</li>
      </ul>
    `,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch((err) => {
      console.error('[Server] Angular SSR Error:', err);
      next(err);
    });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server] Global Error:', err);
  res.status(500).send('Internal Server Error');
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = 3000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
