import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft, Phone, Mail, MessageCircle, Instagram, MapPin, Clock, Headphones } from "lucide-react";

const Contact = () => {
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
            <Headphones className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Need help with your WhiteTag service? Our team is here to assist you with setup, support, and any questions.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* WhatsApp Support */}
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">WhatsApp Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Get instant help via WhatsApp. Perfect for quick questions and emergency support.
              </p>
              <div className="space-y-3">
                <p className="font-medium text-gray-900">+91 96456 71184</p>
                <a 
                  href="https://wa.me/919645671184?text=Hi! I need help with WhiteTag services." 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Phone Support */}
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Phone Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Speak directly with our support team for detailed assistance and technical help.
              </p>
              <div className="space-y-3">
                <p className="font-medium text-gray-900">+91 96456 71184</p>
                <a href="tel:+919645671184">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Email Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Send detailed queries or feedback. We'll respond within 24 hours.
              </p>
              <div className="space-y-3">
                <p className="font-medium text-gray-900">support@whitetag.in</p>
                <a href="mailto:support@whitetag.in?subject=WhiteTag Support Request">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Information */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Business Hours */}
          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Support Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Monday - Friday</span>
                <span className="text-gray-600">9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Saturday</span>
                <span className="text-gray-600">10:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Sunday</span>
                <span className="text-gray-600">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Emergency Support</span>
                <span className="text-green-600 font-medium">24/7 WhatsApp</span>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                All times are in Indian Standard Time (IST). Emergency pet recovery support available 24/7 via WhatsApp.
              </p>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="border border-gray-200 shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Business Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                             <div>
                 <h4 className="font-semibold mb-2">Legal Business Name</h4>
                 <p className="text-gray-600">Whitebranding</p>
               </div>

               <div>
                 <h4 className="font-semibold mb-2">Registered Address</h4>
                 <p className="text-gray-600">Kochi, Kerala, India</p>
               </div>
               
               <div>
                 <h4 className="font-semibold mb-2">Business Registration</h4>
                 <p className="text-gray-600">GST Registered Entity</p>
                 <p className="text-sm text-gray-500">Compliant with Indian GST Act & Consumer Protection Act 2019</p>
               </div>

              <div>
                <h4 className="font-semibold mb-2">Service Areas</h4>
                <p className="text-gray-600">All India delivery available</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Follow Us</h4>
                <div className="flex space-x-4">
                  <a 
                    href="https://instagram.com/jagannath_p_s" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-pink-600 hover:text-pink-700"
                  >
                    <Instagram className="w-5 h-5" />
                    <span>@jagannath_p_s</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Common Questions */}
        <Card className="border border-gray-200 shadow-xs mb-12">
          <CardHeader>
            <CardTitle>Common Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">How do I activate my subscription?</h4>
                  <p className="text-gray-600 text-sm">
                    Contact us via WhatsApp with your payment confirmation. We'll activate your account within 24-48 hours.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">My QR code isn't working. What should I do?</h4>
                  <p className="text-gray-600 text-sm">
                    First, ensure the QR code is clean and undamaged. If issues persist, contact support for a replacement tag.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">How long does delivery take?</h4>
                  <p className="text-gray-600 text-sm">
                    Standard delivery is 3-7 business days across India. Express delivery available in select cities.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Can I update my pet's information?</h4>
                  <p className="text-gray-600 text-sm">
                    Yes! Log into your dashboard or contact support to update pet details, contact information, or photos.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">What if my pet's tag gets damaged?</h4>
                  <p className="text-gray-600 text-sm">
                    We offer 1-year warranty on manufacturing defects. Accidental damage replacement available at discounted rates.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Is my personal information safe?</h4>
                  <p className="text-gray-600 text-sm">
                    Absolutely. We use industry-standard encryption and you control what information is displayed publicly.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border border-red-200 bg-red-50 shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <Phone className="w-5 h-5" />
              <span>Emergency Pet Recovery</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-red-700 mb-2 font-medium">
                  Lost your pet? Need immediate assistance?
                </p>
                <p className="text-red-600 text-sm">
                  Our emergency support is available 24/7 via WhatsApp for urgent pet recovery situations.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <a 
                  href="https://wa.me/919645671184?text=EMERGENCY: My pet is lost and I need immediate help!" 
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

        {/* Footer CTA */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600 mb-6">
            Still have questions? We're here to help you protect your furry family members.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://wa.me/919645671184?text=Hi! I have a question about WhiteTag services." target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with Support
              </Button>
            </a>
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

export default Contact; 