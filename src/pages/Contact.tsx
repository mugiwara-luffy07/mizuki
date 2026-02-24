import { Phone, Mail, Clock, MessageCircle, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTenantStore } from '@/store/tenantStore';

export default function Contact() {
  const { config } = useTenantStore();

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-center">Contact Us</h1>
        <p className="text-muted-foreground text-center mb-12">
          We'd love to hear from you. Get in touch with us!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Call us during working hours:</p>
              <a href="tel:+919942322743" className="text-primary hover:underline">
                +91 9942322743
              </a>
              <br />
              <a href="tel:+919942322743" className="text-primary hover:underline">
                +91 9942322743
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Send us an email:</p>
              <a href="mailto:mizukibeautifulmoon123@gmail.com" className="text-primary hover:underline">
                mizukibeautifulmoon123@gmail.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Chat with us on WhatsApp:</p>
              <a
                href="https://wa.me/919942322743"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                +91 9942322743
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">Monday - Friday</p>
                  <p className="text-muted-foreground">10:00 AM – 7:00 PM (IST)</p>
                </div>
                <div>
                  <p className="font-medium">Saturday</p>
                  <p className="text-muted-foreground">10:00 AM – 2:00 PM (IST)</p>
                </div>
                <div>
                  <p className="font-medium">Sunday</p>
                  <p className="text-muted-foreground">Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Stay connected on social media:</p>
              <div className="flex items-center gap-3">
                {config?.social?.facebook && (
                  <a
                    href={config.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md border border-border hover:bg-muted transition-colors"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {config?.social?.instagram && (
                  <a
                    href={config.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md border border-border hover:bg-muted transition-colors"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {config?.social?.youtube && (
                  <a
                    href={config.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md border border-border hover:bg-muted transition-colors"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {config?.social?.twitter && (
                  <a
                    href={config.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md border border-border hover:bg-muted transition-colors"
                    aria-label="X"
                    title="X"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              For any inquiries, custom orders, or support, please feel free to reach out to us 
              through any of the contact methods above. We're here to help!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}













