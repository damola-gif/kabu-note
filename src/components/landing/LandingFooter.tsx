
export const LandingFooter = () => {
  return (
    <footer className="border-t border-gray-800/50 py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="font-bold text-2xl mb-6">KabuNote</div>
            <p className="text-gray-400 leading-relaxed">
              The future of trading strategies, powered by AI and community collaboration.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-6 text-white">Product</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-6 text-white">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-orange-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-6 text-white">Support</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800/50 mt-16 pt-8 text-center text-gray-400">
          <p>© 2025 KabuNote. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
