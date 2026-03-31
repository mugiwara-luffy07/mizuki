import { Link, useParams } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useTenantStore } from '@/store/tenantStore';

export function Footer() {
  const { tenant } = useParams<{ tenant: string }>();
  const { config } = useTenantStore();

  if (!config || !tenant) return null;

  return (
    <footer className="footer-tenant mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logos/logo.jpeg"
                alt={`${config.brandName} logo`}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold">{config.brandName}</h3>
                <p className="text-xs text-muted-foreground">Unit Of Aadharsh International</p>
              </div>
            </div>
            <p className="text-sm opacity-80 max-w-md leading-relaxed">
              {config.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-80">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to={`/${tenant}/custom-order`}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  Custom Order
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  Fabric Collection
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  Design Gallery
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  Measurement Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-80">Support & Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  Contact Us
                </a>
              </li>
              <li>
                <Link
                  to={`/${tenant}/privacy-policy`}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to={`/${tenant}/terms-conditions`}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to={`/${tenant}/refund-policy`}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to={`/${tenant}/delivery-policy`}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link
                  to={`/${tenant}/disclaimer-policy`}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-current/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-60">
            © {new Date().getFullYear()} {config.brandName}. All rights reserved.
          </p>
          <a
            href="https://digitekera.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <img
              src="/logos/digiteklogo.jpeg"
              alt="Digitek Era"
              className="h-4 w-4 object-contain"
            />
            <span>Powered by DigitekEra</span>
          </a>
          <div className="flex items-center gap-4">
            {config.social.facebook && (
              <a
                href={config.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:opacity-80 transition-opacity"
                aria-label="Facebook"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {config.social.instagram && (
              <a
                href={config.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:opacity-80 transition-opacity"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {config.social.youtube && (
              <a
                href={config.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:opacity-80 transition-opacity"
                aria-label="YouTube"
                title="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
            {config.social.twitter && (
              <a
                href={config.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:opacity-80 transition-opacity"
                aria-label="X"
                title="X"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
