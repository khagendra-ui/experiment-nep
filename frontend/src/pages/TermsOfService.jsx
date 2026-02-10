import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
        <p className="text-slate-600 mb-8">Last updated: Feb 7, 2026</p>

        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Use of the Service</h2>
            <p>By using NepSafe, you agree to provide accurate information and comply with all applicable laws and regulations.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Permits and Bookings</h2>
            <p>Permit and booking approvals are subject to verification and availability. We may decline or cancel requests that violate policy.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Emergency Services</h2>
            <p>SOS features provide assistance based on available contact information. We do not guarantee response times.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account and for all activity under your account.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Contact</h2>
            <p>Email us at support@nepsafe.com for terms-related questions.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
