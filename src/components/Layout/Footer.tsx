
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-section mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/14ed19af-011f-47af-b644-a7d767331b87.png" 
                alt="FoodLoops Logo" 
                className="w-10 h-10 rounded-full"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                FoodLoops
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Reducing food waste, one meal at a time. Join thousands of conscious consumers 
              saving money and helping the environment.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/dashboard" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                Dashboard
              </Link>
              <Link to="/products" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                Browse Products
              </Link>
              <Link to="/community" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                Community
              </Link>
              <Link to="/reviews" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                Reviews
              </Link>
              <Link to="/seller" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                Become a Seller
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Support</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                Help Center
              </a>
              <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                How It Works
              </a>
              <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors">
                Contact Us
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 icon-gold" />
                <span>hello@foodloops.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 icon-gold" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 icon-gold" />
                <span>123 Green Street, Eco City</span>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="border-t border-amber-200 dark:border-gray-700 mt-12 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-amber-600 mb-1">50K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Items Saved</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">2.3M kg</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">CO₂ Reduced</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">15K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Partner Stores</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-amber-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            © 2024 FoodLoops. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mt-4 md:mt-0">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> for a sustainable future
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
