import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ABOUT</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-gray-300">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-gray-300">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-gray-300">Careers</Link></li>
              <li><Link href="/stories" className="hover:text-gray-300">Flipkart Stories</Link></li>
              <li><Link href="/press" className="hover:text-gray-300">Press</Link></li>
              <li><Link href="/wholesale" className="hover:text-gray-300">Flipkart Wholesale</Link></li>
            </ul>
          </div>
          
          {/* Help */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">HELP</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/payments" className="hover:text-gray-300">Payments</Link></li>
              <li><Link href="/shipping" className="hover:text-gray-300">Shipping</Link></li>
              <li><Link href="/cancellation" className="hover:text-gray-300">Cancellation & Returns</Link></li>
              <li><Link href="/faq" className="hover:text-gray-300">FAQ</Link></li>
              <li><Link href="/report" className="hover:text-gray-300">Report Infringement</Link></li>
            </ul>
          </div>
          
          {/* Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">POLICY</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/return-policy" className="hover:text-gray-300">Return Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-300">Terms Of Use</Link></li>
              <li><Link href="/security" className="hover:text-gray-300">Security</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-300">Privacy</Link></li>
              <li><Link href="/sitemap" className="hover:text-gray-300">Sitemap</Link></li>
              <li><Link href="/grievance" className="hover:text-gray-300">Grievance Redressal</Link></li>
            </ul>
          </div>
          
          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SOCIAL</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-gray-300">Facebook</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Twitter</Link></li>
              <li><Link href="#" className="hover:text-gray-300">YouTube</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Instagram</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="text-sm">
                <span>Become a Seller</span>
              </div>
              <div className="text-sm">
                <span>Advertise</span>
              </div>
              <div className="text-sm">
                <span>Gift Cards</span>
              </div>
              <div className="text-sm">
                <span>Help Center</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Flipkart Clone. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
