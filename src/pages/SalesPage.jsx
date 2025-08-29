import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SalesPage() {
  const [copiedState, setCopiedState] = useState({
    subject1: false,
    subject2: false,
    shortEmail: false,
    longEmail: false
  });

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedState({ ...copiedState, [key]: true });
      setTimeout(() => {
        setCopiedState({ ...copiedState, [key]: false });
      }, 2000);
    });
  };

  const subjectLine1 = "Transform Bible Study at [Church Name] with AI-Powered Conversations";
  const subjectLine2 = "Bring Scripture to Life: FaithTalkAI for [Church Name]";
  
  const shortEmailTemplate = `
Dear [Name],

I wanted to share an exciting tool that's helping churches deepen engagement with Scripture. FaithTalkAI lets your members have meaningful conversations with Bible characters, making study more interactive and applicable to modern life.

Our church is considering this for small groups and individual study. Would you be interested in seeing how it works?

Try it free: [Start Free Link]
Book a demo: [Demo Link]

In Christ,
[Your Name]
  `;

  const longEmailTemplate = `
Dear [Name],

I'm reaching out to share an innovative tool that's helping churches grow the Kingdom through deeper Scripture engagement.

FaithTalkAI (https://faithtalkai.com) enables believers to have meaningful conversations with Bible characters, bringing ancient wisdom into modern contexts. Rather than just reading Scripture, members can ask questions, explore difficult passages, and see how biblical principles apply to today's challenges.

Key features:
• Chat with over 50 Bible characters who respond with scriptural knowledge
• Create small group "Roundtable" discussions with multiple characters
• Access guided Bible studies with character insights
• Full admin controls for church leaders
• Completely safe, accurate content with biblical references

Our church at [Church Name] is exploring this for small groups, youth ministry, and personal discipleship. The feedback has been incredible - people are engaging with Scripture in ways they never have before.

Would you be interested in seeing how it works? You can:
• Try it free: [Start Free Link]
• Book a pastor demo: [Demo Link]

I'd be happy to discuss how this might serve your congregation.

In Christ,
[Your Name]
  `;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Grow the Kingdom with <span className="text-yellow-400">AI-Powered</span> Bible Conversations
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Make Bible study more engaging, interactive, and applicable to modern life through meaningful conversations with biblical figures.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                Start Free
              </Link>
              <Link to="/pastors" className="bg-white hover:bg-gray-100 text-blue-900 font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                For Pastors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image Section */}
      <section className="py-8 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="relative max-w-5xl mx-auto">
            <img 
              src="/images/complete-bible.jpg" 
              alt="Biblical figures from the complete Bible, illustrating the depth of characters available for conversation" 
              className="w-full rounded-lg shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent rounded-lg flex items-end">
              <div className="p-6 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white">THE <span className="text-yellow-400">COMPLETE</span> BIBLE</h2>
                <p className="text-white text-lg md:text-xl mt-2">Engage with over 50 biblical figures from Genesis to Revelation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 text-center">What is FaithTalkAI?</h2>
            <div className="bg-blue-50 p-8 rounded-xl shadow-md">
              <p className="text-lg mb-4">
                FaithTalkAI is a Scripture-based conversation platform that enables believers to have meaningful dialogues with biblical figures. Using advanced AI technology grounded in biblical truth, it helps individuals and groups deepen their understanding of Scripture and apply its wisdom to modern life.
              </p>
              <p className="text-lg mb-4">
                Unlike generic AI tools, FaithTalkAI is specifically designed for biblical engagement, with every response rooted in Scripture and theological understanding. It's a powerful tool for churches, small groups, and individuals seeking to grow in their faith journey.
              </p>
              <p className="text-lg font-semibold text-blue-900">
                Our mission: To help believers engage more deeply with God's Word through interactive, biblically-sound conversations that bridge ancient wisdom with contemporary life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-12 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Choose Your Character</h3>
              <p>Select from over 50 biblical figures, from Abraham to Paul, each with unique perspectives based on their biblical accounts.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Ask Questions</h3>
              <p>Engage in conversation by asking questions about Scripture, faith challenges, or how biblical principles apply to modern situations.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Grow Together</h3>
              <p>Use insights in personal study, share conversations with others, or create group discussions with multiple characters in Roundtable mode.</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center">User Features</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Character Conversations
                </h3>
                <p>Engage in one-on-one dialogues with biblical figures who respond based on their scriptural context and theological understanding.</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Roundtable Discussions
                </h3>
                <p>Create multi-character conversations where different biblical perspectives interact on the same topic or question.</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Guided Bible Studies
                </h3>
                <p>Access structured studies enhanced with character insights that bring new dimensions to familiar passages.</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Conversation Sharing
                </h3>
                <p>Share meaningful conversations with friends, family, or small group members via unique links.</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Favorites & History
                </h3>
                <p>Save meaningful conversations and easily return to previous discussions for continued learning.</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Scripture References
                </h3>
                <p>Every response includes biblical references, allowing users to verify insights against Scripture.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin & Pastor Features */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center">Admin & Pastor Features</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  User Management
                </h3>
                <p>Invite members, manage access levels, and organize users into ministry groups or small groups.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Custom Bible Studies
                </h3>
                <p>Create and assign church-specific Bible studies with custom character instructions and discussion prompts.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Roundtable Templates
                </h3>
                <p>Pre-configure character combinations and starting questions for small group facilitation.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Church Branding
                </h3>
                <p>Add your church logo and customize the experience for your congregation (coming soon).</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Engagement Analytics
                </h3>
                <p>Track usage patterns, popular topics, and member engagement to inform ministry decisions (roadmap).</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center text-sm font-bold mr-3">✓</span>
                  Revenue Sharing
                </h3>
                <p>Earn 20% revenue share when members upgrade to premium accounts through your church.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center">Trust & Safety</h2>
            
            <div className="bg-blue-50 p-8 rounded-xl">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Biblical Accuracy</h3>
                  <p className="mb-2">• All responses grounded in Scripture with references</p>
                  <p className="mb-2">• Developed with theological oversight</p>
                  <p className="mb-2">• Transparent about interpretive perspectives</p>
                  <p>• Acknowledges when questions go beyond biblical text</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Privacy & Security</h3>
                  <p className="mb-2">• End-to-end encrypted conversations</p>
                  <p className="mb-2">• No data sold to third parties</p>
                  <p className="mb-2">• Optional anonymous usage</p>
                  <p>• COPPA compliant for youth ministry use</p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-100 rounded-lg">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Our Commitment</h3>
                <p>
                  FaithTalkAI is designed to supplement, not replace, Scripture study and pastoral guidance. We're committed to responsible AI use that serves the Church and honors God's Word.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-16 bg-gradient-to-b from-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Coming Soon</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-700/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Mobile Apps</h3>
                <p>Native iOS and Android apps for on-the-go Bible conversations and study.</p>
              </div>
              
              <div className="bg-blue-700/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Multiple Languages</h3>
                <p>Support for Spanish, Korean, Chinese, and other languages to serve diverse congregations.</p>
              </div>
              
              <div className="bg-blue-700/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Live Facilitation</h3>
                <p>Pastor-led group sessions with real-time character interactions for classes and small groups.</p>
              </div>
              
              <div className="bg-blue-700/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">Church Analytics</h3>
                <p>Detailed insights into engagement patterns to help inform teaching and discipleship strategies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center">What People Are Saying</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="italic mb-4">"FaithTalkAI has transformed our small group discussions. Being able to 'ask' Paul about his letters or have Moses explain the Exodus brings Scripture to life in ways we never imagined."</p>
                <p className="font-bold text-blue-900">— Pastor Michael, Grace Community Church</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="italic mb-4">"Our youth group is actually excited about Bible study now! The interactive nature of FaithTalkAI meets them where they are technologically while deepening their biblical understanding."</p>
                <p className="font-bold text-blue-900">— Sarah, Youth Minister</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="italic mb-4">"As someone who's always struggled with understanding context in Scripture, having conversations with biblical characters has been eye-opening. It's like having a study partner available 24/7."</p>
                <p className="font-bold text-blue-900">— James, Church Member</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="italic mb-4">"The Roundtable feature has been incredible for our leadership team. Exploring how different biblical figures might approach modern church challenges gives us fresh perspectives."</p>
                <p className="font-bold text-blue-900">— Pastor Rebecca, Harvest Fellowship</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6">Ready to Transform Bible Engagement?</h2>
            <p className="text-xl mb-8">Join churches nationwide using AI to deepen Scripture understanding and application.</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                Start Free Trial
              </Link>
              <Link to="/pastors" className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                Pastor Resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Email Template Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center">Email Templates</h2>
            <p className="text-center mb-8">Use these templates to share FaithTalkAI with your church leadership team or congregation.</p>
            
            <div className="mb-10">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Subject Lines</h3>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                  <p className="mb-2">{subjectLine1}</p>
                  <button 
                    onClick={() => copyToClipboard(subjectLine1, 'subject1')}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
                  >
                    {copiedState.subject1 ? 'Copied!' : 'Copy Subject'}
                  </button>
                </div>
                
                <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                  <p className="mb-2">{subjectLine2}</p>
                  <button 
                    onClick={() => copyToClipboard(subjectLine2, 'subject2')}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
                  >
                    {copiedState.subject2 ? 'Copied!' : 'Copy Subject'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-10">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Short Email Template</h3>
              <div className="bg-blue-50 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap font-sans text-sm">{shortEmailTemplate}</pre>
                <button 
                  onClick={() => copyToClipboard(shortEmailTemplate, 'shortEmail')}
                  className="mt-4 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded"
                >
                  {copiedState.shortEmail ? 'Copied!' : 'Copy Short Email'}
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Detailed Email Template</h3>
              <div className="bg-blue-50 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap font-sans text-sm">{longEmailTemplate}</pre>
                <button 
                  onClick={() => copyToClipboard(longEmailTemplate, 'longEmail')}
                  className="mt-4 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded"
                >
                  {copiedState.longEmail ? 'Copied!' : 'Copy Detailed Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
