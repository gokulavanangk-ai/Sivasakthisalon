/**
 * Vercel Node.js serverless entrypoint.
 *
 * The long-running `backend/src/server.ts` (which calls `app.listen()`) is for
 * local/dev processes only. Calling `app.listen()` inside a Lambda never
 * returns a response to the runtime, so Vercel marks every request as
 * `FUNCTION_INVOCATION_FAILED`. On Vercel we export the Express `app` itself;
 * @vercel/node invokes it as the request handler, and the app.ts middleware
 * already connects to MongoDB on demand per request. The compiled backend
 * lives in `backend/dist` (see `scripts/vercel-build.mjs`).
 */
import { app } from '../backend/dist/app';

export default function handler(req: unknown, res: unknown): void {
  (app as unknown as (a: unknown, b: unknown) => void)(req, res);
}