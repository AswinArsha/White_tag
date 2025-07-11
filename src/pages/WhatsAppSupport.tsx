import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft, MessageCircle, Clock, Phone, AlertCircle, CheckCircle, Zap, Shield } from "lucide-react";

const WhatsAppSupport = () => {
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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">WhatsApp Support</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant help via WhatsApp - India's most popular messaging platform. 
            Our support team is ready to assist you 24/7 for emergency pet recovery.
          </p>
        </div>

        {/* WhatsApp Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* General Support */}
          <Card className="border border-green-200 bg-green-50 shadow-lg">
            <CardHeader className="text-center">
              <MessageCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-xl text-green-800">General Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-green-700 mb-6">
                Get help with account setup, subscription activation, QR codes, and general questions.
              </p>
              <a 
                href="https://wa.me/919645671184?text=Hi! I need help with WhiteTag services. Please assist me with my query." 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start WhatsApp Chat
                </Button>
              </a>
              <p className="text-sm text-green-600 mt-3">Response time: Usually within 30 minutes</p>
            </CardContent>
          </Card>

          {/* Emergency Support */}
          <Card className="border border-red-200 bg-red-50 shadow-lg">
            <CardHeader className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-xl text-red-800">Emergency Pet Recovery</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-red-700 mb-6">
                Lost your pet? Get immediate assistance with recovery coordination and local community alerts.
              </p>
              <a 
                href="https://wa.me/919645671184?text=🚨 EMERGENCY: My pet is lost! I need immediate help with recovery. Pet details: [Please provide pet name, location lost, and your contact details]" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Emergency WhatsApp
                </Button>
              </a>
              <p className="text-sm text-red-600 mt-3">Available 24/7 - Immediate response</p>
            </CardContent>
          </Card>
        </div>

        {/* Support Categories */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-center">What can we help you with?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a 
                href="https://wa.me/919645671184?text=Hi! I need help with subscription activation. Here are my payment details: [Please attach payment screenshot]" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  <CheckCircle className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Subscription Activation</h3>
                  <p className="text-sm text-gray-600">Activate your ₹599 annual plan</p>
                </div>
              </a>

              <a 
                href="https://wa.me/919645671184?text=Hi! I'm having trouble with QR code generation/scanning. Can you help me troubleshoot?" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                  <Zap className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-medium text-gray-900">QR Code Issues</h3>
                  <p className="text-sm text-gray-600">Troubleshoot scanning problems</p>
                </div>
              </a>

              <a 
                href="https://wa.me/919645671184?text=Hi! I need to update my pet's information. Can you guide me through the process?" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                  <Shield className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Update Pet Info</h3>
                  <p className="text-sm text-gray-600">Modify pet details and photos</p>
                </div>
              </a>

              <a 
                href="https://wa.me/919645671184?text=Hi! I have a question about delivery status/tracking for my pet tag order." 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                  <Clock className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Delivery Status</h3>
                  <p className="text-sm text-gray-600">Track your pet tag shipment</p>
                </div>
              </a>

              <a 
                href="https://wa.me/919645671184?text=Hi! I need a replacement tag for my pet. Here are the details: [Pet name, reason for replacement]" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Tag Replacement</h3>
                  <p className="text-sm text-gray-600">Request new tags for damage</p>
                </div>
              </a>

              <a 
                href="https://wa.me/919645671184?text=Hi! I have a technical question about WhiteTag services. Can you help?" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Phone className="w-8 h-8 text-gray-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Technical Support</h3>
                  <p className="text-sm text-gray-600">Get help with app features</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Support Hours */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Support Availability</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-gray-900">Regular Support Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-green-600">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Saturday</span>
                    <span className="text-green-600">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Sunday</span>
                    <span className="text-green-600">10:00 AM - 4:00 PM</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-gray-900">Emergency Support</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">24/7 Pet Recovery</span>
                  </div>
                  <p className="text-red-700 text-sm mb-3">
                    Lost pet emergencies are handled immediately, any time of day or night.
                  </p>
                  <p className="text-red-600 text-xs">
                    Include "EMERGENCY" in your message for fastest response
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips for Better Support */}
        <Card className="border border-blue-200 bg-blue-50 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-blue-800">Tips for Faster Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-900">For General Queries:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Include your registered email/phone number</li>
                  <li>• Describe your issue clearly</li>
                  <li>• Mention specific error messages if any</li>
                  <li>• Attach screenshots when helpful</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-900">For Pet Emergencies:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Start message with "EMERGENCY"</li>
                  <li>• Provide pet name and description</li>
                  <li>• Include last known location</li>
                  <li>• Share your contact details</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>WhatsApp Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">+91 96456 71184</h3>
              <p className="text-gray-600 mb-6">
                Save this number in your contacts as "WhiteTag Support" for quick access during emergencies.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a 
                  href="https://wa.me/919645671184" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open WhatsApp
                  </Button>
                </a>
                <Link to="/contact">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Other Contact Options
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppSupport; 