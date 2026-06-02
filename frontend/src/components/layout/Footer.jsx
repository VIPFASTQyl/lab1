import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: '',
      links: [
        { label: '', href: '#' },
        { label: '', href: '#' },
        { label: '', href: '#' },
        { label: '', href: '#' },
      ],
    },
    {
      title: '',
      links: [
        { label: ' ', href: '#' },
        { label: ' ', href: '#' },
        { label: '', href: '#' },
        { label: '', href: '#' },
      ],
    },
    {
      title: '',
      links: [
        { label: ' ', href: '#' },
        { label: '  ', href: '#' },
        { label: ' ', href: '#' },
        { label: '', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61586336113573', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/madverse.ks', label: 'Instagram' },
    
  ];

  return (
    <footer className="bg-gradient-to-r from-white via-[#14b8a6] to-[#041e33] text-[#041e33] border-t border-black/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-[#041e33] mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-[#041e33] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-black/20 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-[#0f766e]">
              © {currentYear} MADVERSE. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/40 transition-colors group"
                  title={social.label}
                >
                  <social.icon size={20} className="text-[#041e33] group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
