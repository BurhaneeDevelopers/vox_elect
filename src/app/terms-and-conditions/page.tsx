import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#FDFAF4] text-[#57534e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-[#E7E0D0]">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#78716c] hover:text-[#2D5016] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#2D5016] mb-6">Terms and Conditions</h1>
        
        <div className="space-y-6 text-sm">
          <p>
            <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
              In addition, when using this application&apos;s particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">2. Informational Purposes Only</h2>
            <p>
              The content provided on this platform is for general informational purposes only. It should not be considered legal, financial, or professional advice. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the application or the information contained on the application for any purpose. Any reliance you place on such information is therefore strictly at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">3. No Liability</h2>
            <p>
              In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this application. We explicitly disclaim any liability for actions taken or not taken based on any or all the contents of this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">4. User Conduct</h2>
            <p>
              You agree not to use the application in a way that may cause the application to be interrupted, damaged, rendered less efficient or such that the effectiveness or functionality of the application is in any way impaired.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">5. Third-Party Links</h2>
            <p>
              Through this application, you may be able to link to other websites which are not under our control. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2D5016] mb-2">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms from time to time at our sole discretion. Therefore, you should review these pages periodically. When we change the Terms in a material manner, we will update the &apos;Effective Date&apos; at the top of this page. Your continued use of the Website or our service after any such change constitutes your acceptance of the new Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
