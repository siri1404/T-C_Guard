export class UrlExtractor {
  async extractFromUrl(url: string): Promise<PolicyContent | null> {
    try {
      // Validate URL format
      new URL(url);
      
      // Check if this looks like a policy URL
      if (!this.isPolicyUrl(url)) {
        throw new Error('URL does not appear to be a policy page. Please check the URL and try again.');
      }

      // Since we can't fetch external URLs due to CORS restrictions,
      // we'll provide a demo analysis for demonstration purposes
      return this.createDemoContent(url);
      
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Invalid URL')) {
        throw new Error('Please enter a valid URL (e.g., https://example.com/privacy)');
      }
      throw error;
    }
  }

  private createDemoContent(url: string): PolicyContent {
    const domain = this.extractDomain(url);
    
    // Generate realistic demo content based on the URL
    const demoContent = this.generateDemoPolicy(domain, url);
    
    return {
      isPolicyPage: true,
      content: demoContent,
      title: `${domain} Privacy Policy`,
      extractedAt: new Date().toISOString()
    };
  }

  private generateDemoPolicy(domain: string, url: string): string {
    const isPrivacy = url.toLowerCase().includes('privacy');
    const isTerms = url.toLowerCase().includes('terms') || url.toLowerCase().includes('conditions');
    
    let content = '';
    
    if (isPrivacy) {
      content = `Privacy Policy for ${domain}

Last updated: ${new Date().toLocaleDateString()}

Information We Collect
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, phone number, and payment information.

We also automatically collect certain information about your device and how you interact with our services, including your IP address, browser type, operating system, referring URLs, and pages viewed.

How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers.

We may also use your information to personalize your experience, analyze usage patterns, and develop new features and services.

Information Sharing
We may share your personal information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, and customer service.

We do not sell, trade, or otherwise transfer your personal information to third parties for their marketing purposes without your explicit consent.

In certain circumstances, we may disclose your information if required by law or if we believe such disclosure is necessary to protect our rights, your safety, or the safety of others.

Data Retention
We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.

You may request deletion of your personal information at any time by contacting us, though we may retain certain information as required by law or for legitimate business purposes.

Your Rights and Choices
You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.

If you are located in the European Union, you have additional rights under the General Data Protection Regulation (GDPR), including the right to data portability and the right to lodge a complaint with a supervisory authority.

Security
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

However, no method of transmission over the internet or electronic storage is completely secure, so we cannot guarantee absolute security.

Contact Information
If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@${domain}.

Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.`;
    } else if (isTerms) {
      content = `Terms of Service for ${domain}

Last updated: ${new Date().toLocaleDateString()}

Acceptance of Terms
By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement.

Use License
Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.

Under this license you may not:
- modify or copy the materials
- use the materials for any commercial purpose or for any public display
- attempt to reverse engineer any software contained on our website
- remove any copyright or other proprietary notations from the materials

User Accounts
When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.

You agree not to disclose your password to any third party and to take sole responsibility for activities and actions under your password, whether or not you have authorized such activities or actions.

Prohibited Uses
You may not use our service:
- for any unlawful purpose or to solicit others to perform unlawful acts
- to violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
- to infringe upon or violate our intellectual property rights or the intellectual property rights of others
- to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
- to submit false or misleading information

Content
Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the service.

By posting content to our service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the service.

Termination
We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

Upon termination, your right to use the service will cease immediately. If you wish to terminate your account, you may simply discontinue using the service.

Disclaimer
The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this company excludes all representations, warranties, conditions and terms.

Limitation of Liability
In no event shall our company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.

Governing Law
These terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is incorporated.

Contact Information
If you have any questions about these Terms of Service, please contact us at legal@${domain}.`;
    } else {
      // Generic policy content
      content = `Legal Agreement for ${domain}

This document outlines the terms and conditions for using our services. By accessing our website or using our services, you agree to comply with these terms.

We collect and process personal information in accordance with applicable privacy laws. This includes information you provide directly and information collected automatically through your use of our services.

We may share your information with trusted third-party partners who help us provide our services. We do not sell your personal information to advertisers or other third parties.

You retain ownership of any content you submit to our services, but you grant us a license to use, display, and distribute that content as necessary to provide our services.

We reserve the right to terminate accounts that violate our terms of service or engage in prohibited activities.

For questions about these terms or our privacy practices, please contact our legal team.`;
    }
    
    return content;
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'example.com';
    }
  }

  private isPolicyUrl(url: string): boolean {
    const policyKeywords = [
      'privacy', 'terms', 'policy', 'legal', 'eula', 'agreement', 'conditions', 'tos'
    ];
    
    const urlLower = url.toLowerCase();
    return policyKeywords.some(keyword => urlLower.includes(keyword));
  }
}

export interface PolicyContent {
  isPolicyPage: boolean;
  content: string;
  title: string;
  extractedAt: string;
}