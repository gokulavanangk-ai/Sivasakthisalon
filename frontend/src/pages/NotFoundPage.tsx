import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <Compass className="h-12 w-12 rotate-12 text-gold" />
      <h1 className="mt-6 font-display text-7xl text-cream">404</h1>
      <p className="mt-3 font-tamil text-xl text-muted">இந்த பக்கத்தை கண்டுபிடிக்க முடியவில்லை.</p>
      <Link to="/" className="btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
}