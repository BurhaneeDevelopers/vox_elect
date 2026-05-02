import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FDFAF4] text-[#57534e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-[#E7E0D0]">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#78716c] hover:text-[#2D5016] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#2D5016] mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm">
          <p>
            <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">1. Information We Collect</h2>
            <p>
              We may collect personal information that you voluntarily provide to us when registering at the application, expressing an interest in obtaining information about us or our products and services, when participating in activities on the application or otherwise contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">2. How We Use Your Information</h2>
            <p>
              We use personal information collected via our application for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              We explicitly state that data is provided "as is" and no guarantees are made regarding its protection against unforeseen breaches, despite our use of industry-standard security measures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">3. Disclaimer of Data Security Guarantees</h2>
            <p>
              While we implement reasonable security measures to protect your information, no method of transmission over the Internet, or method of electronic storage, is 100% secure. Therefore, we cannot guarantee its absolute security. By using this service, you acknowledge and agree that we are not liable for any unauthorized access, use, or disclosure of your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">4. Third-Party Services</h2>
            <p>
              We may use third-party service providers to monitor and analyze the use of our Service. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. We are not responsible for the privacy practices of these third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">5. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
