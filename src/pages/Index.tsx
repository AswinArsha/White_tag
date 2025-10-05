
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Smartphone, QrCode, MapPin, Users, Package, Star, Truck, CheckCircle, ArrowRight, Play } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-xs">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">WhiteTag</span>
              <p className="text-xs text-gray-500">Premium Pet Protection</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-orange-100 text-orange-800 border-orange-200" variant="secondary">
           Made in India
          </Badge>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Keep Your Pets Safe with<br />
            <span className="text-blue-600">Smart ID Technology</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Premium metal pet ID tags with QR codes that instantly connect finders with owners through WhatsApp. 
            We manufacture and deliver custom tags to protect your beloved pets across India.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Order Your Pet Tag
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-green-600" />
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>1 Year Warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">How WhiteTag Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              A simple, secure, and effective pet protection system that works in 3 easy steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">1. Create Digital Profile</CardTitle>
                <CardDescription className="text-base leading-relaxed text-gray-600">
                  Upload your pet's photo, contact details, and create a unique digital profile that's accessible anywhere
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">2. Receive Metal Tag</CardTitle>
                <CardDescription className="text-base leading-relaxed text-gray-600">
                  We manufacture and deliver a premium metal tag with QR code and your pet's name engraved
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">3. Instant Recovery</CardTitle>
                <CardDescription className="text-base leading-relaxed text-gray-600">
                  Anyone who finds your pet can scan the QR code and instantly share their location via WhatsApp
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Why Choose WhiteTag?</h2>
              <p className="text-lg text-gray-600 mb-8">
                WhiteTag combines traditional pet ID tags with modern technology to create the most effective pet recovery system available in India.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Premium Metal Construction</h3>
                    <p className="text-gray-600">Waterproof, scratch-resistant tags that last for years, even with active pets</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">WhatsApp Integration</h3>
                    <p className="text-gray-600">Direct location sharing through India's most popular messaging platform</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Privacy & Safety</h3>
                    <p className="text-gray-600">Complete control over what information you share publicly</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">No App Required</h3>
                    <p className="text-gray-600">QR codes work with any smartphone camera - no special app needed</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:text-center">
              <div className="bg-gray-100 rounded-2xl p-8 inline-block">
                <QrCode className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-center">Sample QR Code<br />on Premium Metal Tag</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Complete Pet Protection</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to keep your furry family members safe and sound
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100">
              <QrCode className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2 text-gray-900">Durable QR Tags</h3>
              <p className="text-sm text-gray-600">Weather-resistant metal tags with laser-engraved QR codes</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100">
              <Smartphone className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="font-semibold mb-2 text-gray-900">Instant Alerts</h3>
              <p className="text-sm text-gray-600">Real-time notifications when someone scans your pet's tag</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100">
              <Shield className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-2 text-gray-900">Privacy Controls</h3>
              <p className="text-sm text-gray-600">Choose exactly what information to display publicly</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100">
              <Users className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="font-semibold mb-2 text-gray-900">Multiple Contacts</h3>
              <p className="text-sm text-gray-600">Add family members and emergency contacts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            One annual plan includes everything - unlimited pets, premium metal tags, and all features
          </p>
          
          <Card className="max-w-lg mx-auto border border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-8">
              <Badge className="w-fit mx-auto mb-4 bg-green-100 text-green-800 border-green-200">
                Most Popular
              </Badge>
              <CardTitle className="text-2xl mb-2 text-gray-900">Annual Plan</CardTitle>
              <div className="text-5xl font-bold text-gray-900 mb-2">₹599</div>
              <CardDescription className="text-lg text-gray-600">per year, everything included</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-center text-base">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0" />
                  Premium metal pet tag with free delivery
                </li>
                <li className="flex items-center text-base">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0" />
                  Unlimited pet profiles and QR codes
                </li>
                <li className="flex items-center text-base">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0" />
                  WhatsApp location sharing integration
                </li>
                <li className="flex items-center text-base">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0" />
                  24/7 customer support via WhatsApp
                </li>
                <li className="flex items-center text-base">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0" />
                  1 year warranty on physical tags
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg" size="lg">
                Contact Admin to Subscribe
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold mb-3">2,000+</div>
              <div className="text-lg opacity-90">Pets Protected</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-3">1,000+</div>
              <div className="text-lg opacity-90">Happy Families</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-3">150+</div>
              <div className="text-lg opacity-90">Successful Reunions</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Protect Your Pet?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of pet parents who trust WhiteTag to keep their furry family members safe
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">WhiteTag</span>
                  <p className="text-sm text-gray-400">Premium Pet Protection</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                India's leading pet protection platform combining traditional ID tags with smart QR technology. 
                Trusted by thousands of pet parents across the country.
              </p>
             
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors">
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link to="/pet/fluffy_the_cat" className="text-gray-400 hover:text-white transition-colors">
                    Sample Pet Profile
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support & Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/support" className="text-gray-400 hover:text-white transition-colors">
                    Support Center
                  </Link>
                </li>
                <li>
                  <Link to="/whatsapp-support" className="text-gray-400 hover:text-white transition-colors">
                    WhatsApp Support
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-400 mb-4 md:mb-0">
                © 2024 WhiteTag by Whitebranding. All rights reserved.

              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Follow us:</span>
                <a href="https://instagram.com/jagannath_p_s" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="https://wa.me/919645671184" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
