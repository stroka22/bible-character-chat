import React from 'react';
import { Link } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const BusinessFeaturesPageScroll = () => {
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
      title: 'Revenue & Pricing Control',
      description: 'Set your own pricing and earn revenue from your community.',
      highlights: [
        'Set premium pricing for your org',
        'Revenue sharing on subscriptions',
        'Grant free premium to members',
        'Track subscription metrics',
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
                Revenue Model
              </h2>
              <p className="text-amber-700 max-w-2xl mx-auto mb-6">
                When your members subscribe to premium, you earn a share of the revenue. 
                No upfront costs - we grow together.
              </p>
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-900">$6.99/mo</div>
                  <div className="text-amber-700 text-sm">Monthly Premium</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-900">$49.99/yr</div>
                  <div className="text-amber-700 text-sm">Annual Premium</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-900">Rev Share</div>
                  <div className="text-amber-700 text-sm">Earn on Subscriptions</div>
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
            </div>
          </div>

        </ScrollWrap>
        <FooterScroll />
      </ScrollBackground>
    </PreviewLayout>
  );
};

export default BusinessFeaturesPageScroll;
