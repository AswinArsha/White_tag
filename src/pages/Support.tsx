import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft, Search, Book, MessageCircle, Phone, Mail, HelpCircle, Settings, Smartphone, QrCode, Package, Shield, AlertCircle, CheckCircle } from "lucide-react";

const Support = () => {
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

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Support Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to your questions, troubleshooting guides, and get help with your WhiteTag pet protection service.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link to="/contact">
            <Card className="border border-gray-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <CardTitle className="text-lg">Live Chat Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">Get instant help via WhatsApp</p>
              </CardContent>
            </Card>
          </Link>

          <a href="tel:+919645671184">
            <Card className="border border-gray-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Phone className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <CardTitle className="text-lg">Call Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">Speak with our support team</p>
              </CardContent>
            </Card>
          </a>

          <a href="mailto:support@whitetag.in">
            <Card className="border border-gray-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Mail className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <CardTitle className="text-lg">Email Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">Send us detailed queries</p>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Help Categories */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Getting Started */}
          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span>Getting Started</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">How to Register Your Pet</h4>
                    <p className="text-sm text-gray-600">Step-by-step guide to create your pet's profile and generate QR codes.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Subscription Activation</h4>
                    <p className="text-sm text-gray-600">Learn how to activate your ₹599 annual subscription and get your pet tags.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Setting Up Privacy Controls</h4>
                    <p className="text-sm text-gray-600">Configure what information is visible when someone scans your pet's QR code.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Help */}
          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <span>QR Code Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">QR Code Not Scanning</h4>
                    <p className="text-sm text-gray-600">Troubleshoot common QR code scanning issues and camera problems.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Generating New QR Codes</h4>
                    <p className="text-sm text-gray-600">How to create and download QR codes for printing on pet tags.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Tag Replacement</h4>
                    <p className="text-sm text-gray-600">Request replacement tags for damaged or lost QR codes.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>Account Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Update Pet Information</h4>
                    <p className="text-sm text-gray-600">Modify your pet's details, photos, and contact information.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Subscription Renewal</h4>
                    <p className="text-sm text-gray-600">Renew your annual subscription and maintain service continuity.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Account Deletion</h4>
                    <p className="text-sm text-gray-600">Request account deletion and data removal if needed.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Orders */}
          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Delivery & Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Track Your Order</h4>
                    <p className="text-sm text-gray-600">Check the status of your metal pet tag delivery across India.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Delivery Issues</h4>
                    <p className="text-sm text-gray-600">Report delivery problems or update your shipping address.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Warranty Claims</h4>
                    <p className="text-sm text-gray-600">File warranty claims for defective tags within 1 year of purchase.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Frequently Asked Questions */}
        <Card className="border border-gray-200 shadow-xs mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Book className="w-5 h-5 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">How does WhiteTag work?</h4>
                  <p className="text-gray-600 text-sm">
                    WhiteTag provides metal pet tags with QR codes. When scanned, the QR code shows your pet's profile and allows finders to share their location via WhatsApp.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">What's included in the ₹599 subscription?</h4>
                  <p className="text-gray-600 text-sm">
                    Annual subscription includes unlimited pet profiles, QR code generation, one metal tag per pet, WhatsApp integration, and 24/7 emergency support.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">How do I activate my subscription?</h4>
                  <p className="text-gray-600 text-sm">
                    After payment, contact our admin via WhatsApp with payment confirmation. Your account will be activated within 24-48 hours.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Can I update my pet's information?</h4>
                  <p className="text-gray-600 text-sm">
                    Yes! You can update all pet details, photos, and contact information anytime through your dashboard or by contacting support.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">How long does delivery take?</h4>
                  <p className="text-gray-600 text-sm">
                    Standard delivery across India is 3-7 business days. Express delivery available in major cities for faster service.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">What if my pet's tag gets damaged?</h4>
                  <p className="text-gray-600 text-sm">
                    We provide 1-year warranty on manufacturing defects. Replacement tags for accidental damage available at discounted rates.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Is my personal information secure?</h4>
                  <p className="text-gray-600 text-sm">
                    Absolutely. We use encryption and you control what information is displayed publicly. Read our Privacy Policy for details.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">How do I contact emergency support?</h4>
                  <p className="text-gray-600 text-sm">
                    For urgent pet recovery situations, contact us 24/7 via WhatsApp at +91 96456 71184 with "EMERGENCY" in your message.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Alert */}
        <Card className="border border-red-200 bg-red-50 shadow-xs mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>Lost Pet Emergency</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-red-700 mb-2 font-medium">
                  Is your pet missing right now?
                </p>
                <p className="text-red-600 text-sm">
                  Contact our emergency support immediately for urgent assistance with pet recovery and coordinating with local communities.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <a 
                  href="https://wa.me/919645671184?text=EMERGENCY: My pet is lost! I need immediate help." 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Emergency WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Still Need Help */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xs border border-gray-200">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Still Need Help?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Our support team is here to help you with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Contact Support Team
                </Button>
              </Link>
              <a href="https://wa.me/919645671184?text=Hi! I need help with WhiteTag services." target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Chat
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support; 