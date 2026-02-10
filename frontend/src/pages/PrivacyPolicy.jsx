import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-600 mb-8">Last updated: Feb 7, 2026</p>

        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
            <p>We collect the information you provide during registration, booking, and permit applications. This may include your name, email, contact details, and travel information.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">How We Use Data</h2>
            <p>We use your data to provide services, process permits and bookings, improve safety features, and communicate updates. We do not sell personal information.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Data Protection</h2>
            <p>Passwords are stored securely using hashing. Access to sensitive data is restricted to authorized staff for support and administration.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
            <p>You can request access, correction, or deletion of your data. Contact support to make a request.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Contact</h2>
            <p>Email us at support@nepsafe.com for privacy-related questions.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
