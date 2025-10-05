import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft, FileText, Scale, AlertCircle, CheckCircle, Phone, Mail } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-xs">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">WhiteTag</span>
              <p className="text-xs text-gray-500">Premium Pet Protection</p>
            </div>
          </Link>
          <Link to="/">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Terms of Service</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Important legal terms governing your use of WhiteTag services. Please read carefully before using our platform.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: December 2024</p>
        </div>

        {/* Terms Overview */}
        <Card className="mb-8 border border-gray-200 shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Terms Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>What You Get</span>
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-7">
                  <li>Premium metal pet ID tags</li>
                  <li>Digital pet profile platform</li>
                  <li>QR code technology</li>
                  <li>24/7 emergency contact system</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>Your Responsibilities</span>
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-7">
                  <li>Provide accurate information</li>
                  <li>Use service appropriately</li>
                  <li>Maintain tag on your pet</li>
                  <li>Pay subscription fees on time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8">
          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                By using WhiteTag services, you agree to be bound by these Terms of Service and our Privacy Policy. 
                If you do not agree to these terms, please do not use our services.
              </p>
              <p className="text-gray-700">
                These terms apply to all users, including pet owners, administrators, and anyone who scans QR codes 
                to access pet profiles.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                WhiteTag provides:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Physical Pet Tags:</strong> Durable metal tags with engraved QR codes</li>
                <li><strong>Digital Platform:</strong> Online profiles for pets with emergency contact information</li>
                <li><strong>QR Technology:</strong> Instant access to pet information via smartphone scanning</li>
                <li><strong>Communication Tools:</strong> WhatsApp integration for location sharing</li>
                <li><strong>Customer Support:</strong> Assistance with service setup and usage</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>3. User Accounts & Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Requirements</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>You must be 18+ years old or have parental consent</li>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>You are responsible for all activities under your account</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Pet Information</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>You must own or have legal custody of pets you register</li>
                  <li>Information provided must be accurate and up-to-date</li>
                  <li>Photos must be clear and recent</li>
                  <li>Contact information must be current and accessible</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>4. Subscription & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Annual Subscription</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Service fee: ₹599 per year</li>
                  <li>Includes unlimited pet profiles</li>
                  <li>One physical metal tag per pet included</li>
                  <li>Manual activation by admin required</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Payment Terms</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Payment processed manually through UPI/bank transfer</li>
                  <li>Service activated within 24-48 hours of payment confirmation</li>
                  <li>Annual renewal required for continued service</li>
                  <li>No automatic renewals - manual process only</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Refunds</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>7-day money-back guarantee for new subscriptions</li>
                  <li>Physical tags must be returned for full refund</li>
                  <li>No refunds after 7 days or if tags are damaged/lost</li>
                  <li>Service fees are non-refundable after activation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>5. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Permitted Use</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Creating profiles for pets you own or have custody of</li>
                  <li>Using QR codes for pet identification and recovery</li>
                  <li>Sharing location information to help reunite lost pets</li>
                  <li>Contacting pet owners through provided methods</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Prohibited Activities</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Creating fake or fraudulent pet profiles</li>
                  <li>Misusing contact information for spam or harassment</li>
                  <li>Attempting to access other users' accounts</li>
                  <li>Using the service for any illegal activities</li>
                  <li>Reproducing or selling QR codes without authorization</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Important Disclaimer</h4>
                    <p className="text-yellow-800 text-sm">
                      WhiteTag is a tool to assist in pet recovery. We cannot guarantee the return of lost pets 
                      and are not responsible for the actions of third parties who find your pet.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Service Limitations</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>QR codes depend on finder's willingness to scan and contact</li>
                  <li>WhatsApp integration requires internet connectivity</li>
                  <li>Physical tags may be damaged, lost, or removed</li>
                  <li>Service availability depends on technical infrastructure</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Liability Limits</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Maximum liability limited to annual subscription fee</li>
                  <li>No liability for indirect or consequential damages</li>
                  <li>No responsibility for actions of pet finders</li>
                  <li>Physical tag warranty limited to manufacturing defects</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>7. Data Protection & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy for detailed information about:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>What information we collect and how we use it</li>
                <li>Your privacy controls and choices</li>
                <li>How we protect your data</li>
                <li>Your rights regarding personal information</li>
              </ul>
              <div className="mt-4">
                <Link to="/privacy">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    Read Privacy Policy
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>8. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Termination</h4>
                <p className="text-gray-700 mb-2">You may terminate your account at any time by:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Contacting customer support</li>
                  <li>Requesting account deletion</li>
                  <li>Not renewing your annual subscription</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Service Termination by WhiteTag</h4>
                <p className="text-gray-700 mb-2">We may terminate service for:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Violation of these terms</li>
                  <li>Non-payment of subscription fees</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Business closure (with 30 days notice)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>9. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We may update these Terms of Service from time to time. We will notify users of significant changes via:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Email notification to registered users</li>
                <li>WhatsApp message to active subscribers</li>
                <li>Notice on our website and platform</li>
                <li>30 days advance notice for material changes</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>10. Indian Law Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Consumer Rights (Consumer Protection Act 2019)</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Right to be informed about product quality and specifications</li>
                  <li>Right to choose and seek redressal of grievances</li>
                  <li>Right to consumer education and fair trade practices</li>
                  <li>Deficiency in service can be complained to Consumer Forum</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">GST Compliance</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>All services subject to applicable GST as per current rates</li>
                  <li>GST invoices provided for subscription payments</li>
                  <li>Input tax credit available for business subscribers</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Dispute Resolution</h4>
                <p className="text-gray-700 mb-2">For any disputes:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>First attempt resolution through customer support</li>
                  <li>Mediation preferred before litigation</li>
                  <li>Courts in Kochi, Kerala have exclusive jurisdiction</li>
                  <li>Consumer forums for service deficiency complaints</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service or our services, contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone/WhatsApp</p>
                    <p className="text-gray-600">+91 96456 71184</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">legal@whitetag.in</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p><strong>Legal Business Name:</strong> Whitebranding</p>
                <p><strong>GST Registration:</strong> Registered under Indian GST Act</p>
                <p><strong>Business Address:</strong> Kochi, Kerala, India</p>
                <p><strong>Governing Law:</strong> These terms are governed by Indian law and subject to jurisdiction of Kerala courts</p>
                <p><strong>Compliance:</strong> Consumer Protection Act 2019, IT Act 2000, Personal Data Protection Bill</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600 mb-6">
            Ready to get started with WhiteTag pet protection?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started Today
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms; 