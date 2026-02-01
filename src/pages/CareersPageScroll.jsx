import React from 'react';
import { Link } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const CareersPageScroll = () => {
  const values = [
    { title: 'Faith-Driven', desc: 'We build technology that honors God and serves His people.' },
    { title: 'Excellence', desc: 'We strive for quality in everything we create.' },
    { title: 'Innovation', desc: 'We embrace new ideas that advance our mission.' },
    { title: 'Community', desc: 'We support each other and those we serve.' },
  ];

  const openings = [
    { title: 'Senior Full-Stack Developer', type: 'Full-time', location: 'Remote' },
    { title: 'AI/ML Engineer', type: 'Full-time', location: 'Remote' },
    { title: 'Content Writer - Biblical Studies', type: 'Part-time', location: 'Remote' },
    { title: 'Customer Support Specialist', type: 'Full-time', location: 'Remote' },
  ];

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Join Our Team
            </h1>
            <p className="text-amber-700 text-lg max-w-2xl mx-auto">
              Help us bring Biblical wisdom to life through technology. We're looking for passionate people 
              who want to make a difference in how people engage with Scripture.
            </p>
          </div>

          <ScrollDivider />

          {/* Our Values */}
          <section className="mt-8 mb-10">
            <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center" style={{ fontFamily: 'Cinzel, serif' }}>Our Values</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {values.map((value, i) => (
                <div key={i} className="bg-white/80 rounded-xl border border-amber-200 p-5">
                  <h3 className="font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>{value.title}</h3>
                  <p className="text-amber-700 text-sm" style={{ fontFamily: 'Georgia, serif' }}>{value.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center" style={{ fontFamily: 'Cinzel, serif' }}>Why Work With Us</h2>
            <div className="bg-amber-100/50 rounded-xl border border-amber-200 p-6">
              <div className="grid md:grid-cols-2 gap-4 text-amber-800" style={{ fontFamily: 'Georgia, serif' }}>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><span className="text-amber-600">✓</span> Fully remote work</li>
                  <li className="flex items-center gap-2"><span className="text-amber-600">✓</span> Flexible hours</li>
                  <li className="flex items-center gap-2"><span className="text-amber-600">✓</span> Competitive compensation</li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><span className="text-amber-600">✓</span> Health benefits</li>
                  <li className="flex items-center gap-2"><span className="text-amber-600">✓</span> Professional development</li>
                  <li className="flex items-center gap-2"><span className="text-amber-600">✓</span> Mission-driven work</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Open Positions */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center" style={{ fontFamily: 'Cinzel, serif' }}>Open Positions</h2>
            <div className="space-y-4">
              {openings.map((job, i) => (
                <div key={i} className="bg-white/80 rounded-xl border border-amber-200 p-5 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>{job.title}</h3>
                    <p className="text-amber-600 text-sm">{job.type} • {job.location}</p>
                  </div>
                  <a 
                    href={`mailto:careers@faithtalkai.com?subject=Application: ${job.title}`}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
                  >
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* No openings that fit? */}
          <section className="text-center bg-white/80 rounded-xl border border-amber-200 p-8">
            <h3 className="text-xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>Don't see a perfect fit?</h3>
            <p className="text-amber-700 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              We're always looking for talented individuals who share our mission. Send us your resume 
              and tell us how you'd like to contribute.
            </p>
            <a 
              href="mailto:careers@faithtalkai.com?subject=General Application"
              className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 inline-block"
            >
              Send Your Resume
            </a>
          </section>

          <div className="mt-8 text-center">
            <Link to="/" className="text-amber-600 hover:text-amber-800 text-sm">← Back to Home</Link>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default CareersPageScroll;
