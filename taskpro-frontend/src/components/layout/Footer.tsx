import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HeartIcon, ShieldCheckIcon, GlobeAltIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline"

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "API", href: "/api" },
      { name: "Integrations", href: "/integrations" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Documentation", href: "/docs" },
      { name: "Status", href: "/status" },
      { name: "Community", href: "/community" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TaskPro</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              {t("footer.description") ||
                "The modern project management platform that helps teams collaborate, organize, and deliver exceptional results."}
            </p>

            {/* Trust indicators */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <GlobeAltIcon className="h-4 w-4 text-blue-500" />
                <span>GDPR Compliant</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">10K+</div>
                <div className="text-xs text-gray-500">Teams</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">50K+</div>
                <div className="text-xs text-gray-500">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">99.9%</div>
                <div className="text-xs text-gray-500">Uptime</div>
              </div>
            </div>
          </div>

          {/* Links sections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {t("footer.product") || "Product"}
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-600 hover:text-indigo-600 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {t("footer.company") || "Company"}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-600 hover:text-indigo-600 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {t("footer.support") || "Support"}
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-600 hover:text-indigo-600 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Quick support */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900">Need help?</span>
              </div>
              <Link to="/support" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>© {currentYear} TaskPro Inc. All rights reserved.</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span>Made with</span>
                <HeartIcon className="h-4 w-4 text-red-500" />
                <span>in France</span>
              </span>
            </div>

            {/* Legal links */}
            <div className="flex items-center space-x-6">
              {footerLinks.legal.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                    {link.name}
                  </Link>
                  {index < footerLinks.legal.length - 1 && <span className="text-gray-300">•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
              <span>•</span>
              <Link to="/status" className="text-indigo-600 hover:text-indigo-700">
                Status page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
