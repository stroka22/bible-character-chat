import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const BusinessFeaturesPageScroll = () => {
  const [generating, setGenerating] = useState(false);

  const generatePDF = () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = 20;

      // Helper function to add text with word wrap
      const addWrappedText = (text, x, startY, maxWidth, lineHeight = 6) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line, i) => {
          if (startY + (i * lineHeight) > 270) {
            doc.addPage();
            startY = 20;
            y = 20;
          }
          doc.text(line, x, startY + (i * lineHeight));
        });
        return startY + (lines.length * lineHeight);
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text('FaithTalkAI for Ministry', pageWidth / 2, y, { align: 'center' });
      y += 12;

      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 53, 15); // amber-700
      doc.text('Launch your own AI-powered ministry platform', pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Divider line
      doc.setDrawColor(217, 119, 6); // amber-500
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Value Proposition
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('Your Ministry, Your Platform', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      y = addWrappedText(
        'FaithTalkAI provides churches, ministries, and faith-based organizations with a complete AI-powered platform they can customize and offer to their communities. Keep your branding, align with your theology, and engage your community like never before.',
        margin, y, contentWidth
      );
      y += 10;

      // Core Features Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('Core Platform Features', margin, y);
      y += 8;

      const allFeatures = [
        { title: 'Your Own Branded Organization', desc: 'Custom name, logo, colors, and welcome messages for a white-label experience.' },
        { title: 'User & Member Management', desc: 'Add users, assign admin roles, grant premium access, and track engagement.' },
        { title: 'Customize Character Prompts', desc: 'Tailor biblical characters to align with your theology and denomination.' },
        { title: 'Create Custom Characters', desc: 'Add your own AI characters - including yourself or your pastor for 24/7 engagement.' },
        { title: 'Custom Bible Studies', desc: 'Edit studies to fit your curriculum, customize guides, and control visibility.' },
        { title: 'Reading Plan Management', desc: 'Access 148+ plans, feature specific ones, and organize by categories.' },
        { title: 'Featured Character Control', desc: 'Set which character greets your community, aligned with sermon series.' },
      ];

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      allFeatures.forEach((feature) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('• ' + feature.title, margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(feature.desc, margin + 5, y, contentWidth - 5);
        y += 4;
      });

      y += 5;

      // Admin Tools Section
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('Admin & Management Tools', margin, y);
      y += 8;

      const adminFeatures = [
        { title: 'Admin Dashboard', desc: 'Comprehensive control center for all content and users.' },
        { title: 'Premium & Access Control', desc: 'Manage premium access and track member status.' },
        { title: 'Account Tier Settings', desc: 'Set free message limits and configure premium-only features.' },
        { title: 'Character Group Management', desc: 'Organize biblical characters into themed groups.' },
        { title: 'Invite System', desc: 'Send invitations, track status, and grow your community.' },
        { title: 'Analytics & Reporting', desc: 'Weekly reports, engagement tracking, and member insights.' },
      ];

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      adminFeatures.forEach((feature) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('• ' + feature.title, margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(feature.desc, margin + 5, y, contentWidth - 5);
        y += 4;
      });

      y += 5;

      // Why Partner Section
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('Why Partner With FaithTalkAI?', margin, y);
      y += 8;

      const whyPartner = [
        'Proven Technology - Built on enterprise-grade AI with biblical accuracy',
        'No Development Required - Everything is ready to go',
        'Ongoing Updates - New features, characters, and studies added regularly',
        'Full Support - Training and support to help you succeed',
      ];

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      whyPartner.forEach((item) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.text('• ' + item, margin, y);
        y += 6;
      });

      y += 10;

      // Contact Section
      if (y > 200) {
        doc.addPage();
        y = 20;
      }

      doc.setDrawColor(217, 119, 6);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('Ready to Launch Your Ministry?', pageWidth / 2, y, { align: 'center' });
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text('Contact us to discuss partnership options', pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Contact Info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Email:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text('support@FaithTalkAI.com', margin + 15, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Website:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text('www.FaithTalkAI.com', margin + 20, y);
      y += 12;

      // Social Media
      doc.setFont('helvetica', 'bold');
      doc.text('Follow Us:', margin, y);
      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.text('Instagram: @Faith_Talk_AI', margin + 5, y);
      y += 6;
      doc.text('TikTok: @faithtalkai', margin + 5, y);
      y += 6;
      doc.text('Facebook: Faith Talk AI', margin + 5, y);
      y += 15;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('© ' + new Date().getFullYear() + ' FaithTalkAI. All rights reserved.', pageWidth / 2, 285, { align: 'center' });

      // Save the PDF
      doc.save('FaithTalkAI-Ministry-Partnership.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const coreFeatures = [
    {
      icon: '🏢',
      title: 'Your Own Branded Organization',
      description: 'Launch your own faith-based AI ministry with custom branding.',
      highlights: [
        'Custom organization name and slug',
        'Your own logo and brand colors',
        'Personalized welcome messages',
        'White-label experience for your community',
      ],
    },
    {
      icon: '👥',
      title: 'User & Member Management',
      description: 'Full control over your community members and their access.',
      highlights: [
        'Add and manage users in your organization',
        'Assign admin roles to team members',
        'Grant premium access to members',
        'View member activity and engagement',
      ],
    },
    {
      icon: '✏️',
      title: 'Customize Character Prompts',
      description: 'Tailor biblical characters to align with your theology and beliefs.',
      highlights: [
        'Edit character personas and responses',
        'Adjust prompts for your denomination',
        'Create consistency with your teaching',
        'Changes only affect your organization',
      ],
    },
    {
      icon: '🧑‍🏫',
      title: 'Create Custom Characters',
      description: 'Add your own AI characters - including yourself or your pastor.',
      highlights: [
        'Create a character of your ministry leader',
        'Let your community chat with "you" 24/7',
        'Train on your teachings and worldview',
        'Extend your reach and availability',
      ],
    },
    {
      icon: '📖',
      title: 'Custom Bible Studies',
      description: 'Create and customize Bible studies for your congregation.',
      highlights: [
        'Edit existing studies to fit your curriculum',
        'Customize study guides and lessons',
        'Set which studies are featured',
        'Control visibility and access',
      ],
    },
    {
      icon: '📅',
      title: 'Reading Plan Management',
      description: 'Curate and customize reading plans for your community.',
      highlights: [
        'Access to 148+ reading plans',
        'Feature specific plans for your church',
        'Customize plan content when needed',
        'Organize by categories and themes',
      ],
    },
    {
      icon: '⭐',
      title: 'Featured Character Control',
      description: 'Set which character greets your community on the homepage.',
      highlights: [
        'Choose your featured character',
        'Align with current sermon series',
        'Rotate seasonally or topically',
        'Create engagement with specific figures',
      ],
    },
  ];

  const adminFeatures = [
    {
      icon: '📊',
      title: 'Admin Dashboard',
      description: 'Comprehensive control center for your ministry.',
      highlights: [
        'Overview of all content and users',
        'Quick access to all management tools',
        'Monitor organization health',
        'Manage settings in one place',
      ],
    },
    {
      icon: '💰',
      title: 'Premium & Access Control',
      description: 'Manage premium access for your community members.',
      highlights: [
        'Grant premium access to members',
        'Track premium vs free members',
        'Manage subscription status',
        'View member engagement',
      ],
    },
    {
      icon: '🎚️',
      title: 'Account Tier Settings',
      description: 'Control free vs premium access for your organization.',
      highlights: [
        'Set free message limits',
        'Define which characters are free',
        'Configure premium-only features',
        'Customize roundtable access',
      ],
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'Character Group Management',
      description: 'Organize biblical characters into themed groups for easier discovery.',
      highlights: [
        'Create themed groups (Prophets, Apostles, etc.)',
        'Assign characters to multiple groups',
        'Set display order and icons',
        'Help users find relevant characters',
      ],
    },
    {
      icon: '📧',
      title: 'Invite System',
      description: 'Grow your community with easy invitation tools.',
      highlights: [
        'Send email invitations',
        'Track invitation status',
        'Automatic org assignment',
        'Bulk invite capabilities',
      ],
    },
    {
      icon: '📈',
      title: 'Analytics & Reporting',
      description: 'Understand how your community engages with the platform.',
      highlights: [
        'Premium vs free member breakdown',
        'Weekly CSV reports via email',
        'User engagement tracking',
        'Subscription analytics',
      ],
    },
  ];

  const whyPartner = [
    {
      title: 'Proven Technology',
      description: 'Built on enterprise-grade AI with biblical accuracy guardrails.',
      icon: '🛡️',
    },
    {
      title: 'No Development Required',
      description: 'Everything is ready to go - just customize and launch.',
      icon: '🚀',
    },
    {
      title: 'Ongoing Updates',
      description: 'New features, characters, and studies added regularly.',
      icon: '🔄',
    },
    {
      title: 'Full Support',
      description: 'Training and support to help you succeed.',
      icon: '🤝',
    },
  ];

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              FaithTalkAI for Ministry
            </h1>
            <p className="text-amber-700 text-lg max-w-2xl mx-auto">
              Launch your own AI-powered ministry platform with full customization and revenue sharing
            </p>
          </div>

          <ScrollDivider />

          {/* Value Proposition */}
          <div className="mt-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-8 border border-amber-300">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                Your Ministry, Your Platform, Your Revenue
              </h2>
              <p className="text-amber-700 max-w-2xl mx-auto">
                FaithTalkAI provides churches, ministries, and faith-based organizations with a complete 
                AI-powered platform they can customize and offer to their communities. Keep your branding, 
                align with your theology, and earn revenue from premium subscriptions.
              </p>
            </div>
          </div>

          <ScrollDivider />

          {/* Core Features */}
          <div className="mt-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                Core Platform Features
              </h2>
              <p className="text-amber-700">Everything you need to run your faith-based AI ministry</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {coreFeatures.map((feature, i) => (
                <div key={i} className="bg-white/80 rounded-xl border border-amber-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-900 text-lg mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                        {feature.title}
                      </h3>
                      <p className="text-amber-700 text-sm mb-3">{feature.description}</p>
                      <ul className="space-y-1">
                        {feature.highlights.map((highlight, j) => (
                          <li key={j} className="text-amber-600 text-sm flex items-start gap-2">
                            <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ScrollDivider />

          {/* Admin Features */}
          <div className="mt-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                Admin & Management Tools
              </h2>
              <p className="text-amber-700">Powerful tools to manage your ministry platform</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {adminFeatures.map((feature, i) => (
                <div key={i} className="bg-white/80 rounded-xl border border-amber-200 p-5 hover:shadow-lg transition-shadow">
                  <div className="text-2xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                    {feature.title}
                  </h3>
                  <p className="text-amber-700 text-sm mb-3">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.highlights.map((highlight, j) => (
                      <li key={j} className="text-amber-600 text-xs flex items-start gap-2">
                        <svg className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <ScrollDivider />

          {/* Why Partner */}
          <div className="mt-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                Why Partner With FaithTalkAI?
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {whyPartner.map((item, i) => (
                <div key={i} className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-300 p-5 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-amber-900 mb-1">{item.title}</h3>
                  <p className="text-amber-700 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <ScrollDivider />

          {/* Pricing Teaser */}
          <div className="mt-10 bg-white/80 rounded-xl border border-amber-200 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                Partnership Options
              </h2>
              <p className="text-amber-700 max-w-2xl mx-auto mb-6">
                We offer flexible partnership models to fit your ministry's needs. 
                Contact us to discuss the best option for your organization.
              </p>
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-900">🚀</div>
                  <div className="text-amber-700 text-sm font-medium">Quick Setup</div>
                  <div className="text-amber-600 text-xs mt-1">Get started fast</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-900">🎨</div>
                  <div className="text-amber-700 text-sm font-medium">Full Customization</div>
                  <div className="text-amber-600 text-xs mt-1">Your brand, your way</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-900">🤝</div>
                  <div className="text-amber-700 text-sm font-medium">Ongoing Support</div>
                  <div className="text-amber-600 text-xs mt-1">We grow together</div>
                </div>
              </div>
            </div>
          </div>

          <ScrollDivider />

          {/* CTA Section */}
          <div className="mt-10 text-center bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-8 border border-amber-300">
            <h2 className="text-2xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
              Ready to Launch Your Ministry?
            </h2>
            <p className="text-amber-700 mb-6 max-w-xl mx-auto">
              Join churches and ministries already using FaithTalkAI to engage their communities in Scripture.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
              >
                Contact Us to Get Started
              </Link>
              <Link
                to="/features"
                className="px-6 py-3 bg-white hover:bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-300 transition-colors"
              >
                View User Features
              </Link>
              <button
                onClick={generatePDF}
                disabled={generating}
                className="px-6 py-3 bg-white hover:bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-300 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {generating ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>

        </ScrollWrap>
        <FooterScroll />
      </ScrollBackground>
    </PreviewLayout>
  );
};

export default BusinessFeaturesPageScroll;
