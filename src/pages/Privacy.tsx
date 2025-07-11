import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft, Shield, Eye, Lock, Database, Phone, Mail } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
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
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy and your pet's safety are our top priorities. Learn how we protect and handle your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">Last updated: December 2024</p>
        </div>

        {/* Privacy Overview */}
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Privacy at a Glance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Lock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Data Security</h3>
                <p className="text-sm text-gray-600">Your personal information is encrypted and stored securely</p>
              </div>
              <div className="text-center">
                <Database className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Minimal Collection</h3>
                <p className="text-sm text-gray-600">We only collect data necessary for pet protection services</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Your Control</h3>
                <p className="text-sm text-gray-600">You decide what information to share publicly</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-8">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Pet Information</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Pet name, breed, age, and physical description</li>
                  <li>Pet photos for identification purposes</li>
                  <li>Unique username for public pet profiles</li>
                  <li>Medical information (if voluntarily provided)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Owner Information</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Name and contact details (phone, email)</li>
                  <li>WhatsApp number for emergency contact</li>
                  <li>Address (optional, for tag delivery)</li>
                  <li>Instagram handle (optional)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Technical Information</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>QR code scan analytics (anonymous)</li>
                  <li>Device information for app functionality</li>
                  <li>Location data when shared voluntarily</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Pet Recovery:</strong> Display pet information to help reunite lost pets with owners</li>
                <li><strong>QR Tag Creation:</strong> Generate unique QR codes linked to pet profiles</li>
                <li><strong>Communication:</strong> Send notifications when your pet's QR code is scanned</li>
                <li><strong>Service Delivery:</strong> Process orders and deliver physical pet tags</li>
                <li><strong>Support:</strong> Provide customer service and technical assistance</li>
                <li><strong>Improvements:</strong> Analyze usage patterns to enhance our services</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>3. Information Sharing & Privacy Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Public Pet Profiles</h4>
                <p className="text-gray-700 mb-2">
                  When someone scans your pet's QR code, they can see:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Pet name, photo, and basic description</li>
                  <li>Contact information you choose to display</li>
                  <li>Emergency contact methods (phone, WhatsApp)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Your Privacy Controls</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Choose which contact methods to display publicly</li>
                  <li>Control whether to show your address</li>
                  <li>Decide what pet information to include</li>
                  <li>Update or delete your profile at any time</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Third-Party Sharing</h4>
                <p className="text-gray-700">
                  We <strong>never</strong> sell your personal information. We only share data with:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>WhatsApp (for direct messaging functionality)</li>
                  <li>Delivery partners (for shipping addresses only)</li>
                  <li>Legal authorities (if required by law)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>All data is encrypted in transit and at rest</li>
                <li>Secure servers with regular security audits</li>
                <li>Limited employee access on a need-to-know basis</li>
                <li>Regular backups to prevent data loss</li>
                <li>Compliance with Indian data protection regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Update:</strong> Modify your information at any time</li>
                <li><strong>Delete:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a standard format</li>
                <li><strong>Withdraw Consent:</strong> Opt out of non-essential data processing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>6. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or your data, please contact us:
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
                     <p className="text-gray-600">privacy@whitetag.in</p>
                   </div>
                 </div>
               </div>
               
               <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                 <h4 className="font-semibold text-blue-900 mb-2">Business Information</h4>
                 <div className="text-sm text-blue-800 space-y-1">
                   <p><strong>Legal Entity:</strong> Whitebranding</p>
                   <p><strong>GST Status:</strong> Registered under Indian GST Act</p>
                   <p><strong>Address:</strong> Kochi, Kerala, India</p>
                   <p><strong>Data Protection Compliance:</strong> Indian IT Act 2000, Consumer Protection Act 2019</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600 mb-6">
            Ready to protect your pet with complete privacy control?
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

export default Privacy; 