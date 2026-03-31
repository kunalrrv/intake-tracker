import React from 'react';
import { motion } from 'motion/react';
import { HeartHandshake, ExternalLink, Phone, Globe, MessageSquare } from 'lucide-react';

const ORGANIZATIONS = [
  {
    name: "Alcoholics Anonymous (AA)",
    description: "A global, community-based program that helps people achieve and maintain sobriety through a 12-step program and peer support.",
    website: "https://www.aa.org",
    phone: "Check local listings",
    tags: ["Peer Support", "12-Step", "Global"]
  },
  {
    name: "SMART Recovery",
    description: "Self-Management and Recovery Training. A science-based program that focuses on self-empowerment and cognitive-behavioral tools.",
    website: "https://www.smartrecovery.org",
    phone: "440-951-5357",
    tags: ["Science-Based", "Self-Empowerment", "Tools"]
  },
  {
    name: "SAMHSA National Helpline",
    description: "Substance Abuse and Mental Health Services Administration. A confidential, free, 24/7, 365-day-a-year information service for individuals and family members.",
    website: "https://www.samhsa.gov",
    phone: "1-800-662-HELP (4357)",
    tags: ["24/7 Helpline", "Government", "Confidential"]
  },
  {
    name: "Rethinking Drinking (NIAAA)",
    description: "An interactive website from the National Institute on Alcohol Abuse and Alcoholism (NIAAA) that helps you evaluate your drinking habits.",
    website: "https://www.rethinkingdrinking.niaaa.nih.gov",
    phone: "N/A",
    tags: ["Education", "Self-Assessment", "Research"]
  },
  {
    name: "Moderation Management (MM)",
    description: "A behavioral change program and national support group network for people concerned about their drinking who want to make positive lifestyle changes.",
    website: "https://www.moderation.org",
    phone: "N/A",
    tags: ["Moderation", "Behavioral Change", "Support"]
  }
];

export default function HelpMe() {
  return (
    <div className="space-y-6">
      <div className="bg-red-50 p-6 rounded-3xl border border-red-100 mb-8">
        <div className="flex items-center gap-3 text-red-800 mb-3">
          <HeartHandshake size={24} />
          <h2 className="text-xl font-bold">Support Resources</h2>
        </div>
        <p className="text-red-700/80 text-sm leading-relaxed">
          If you feel that your alcohol consumption is becoming a concern, there are many professional and community organizations ready to help. You don't have to do this alone.
        </p>
      </div>

      <div className="grid gap-4">
        {ORGANIZATIONS.map((org, index) => (
          <motion.div
            key={org.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-gray-900">{org.name}</h3>
              <div className="flex gap-1">
                {org.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {org.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
              <a 
                href={org.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-red-800 text-sm font-bold hover:underline"
              >
                <Globe size={16} />
                <span>Visit Website</span>
                <ExternalLink size={12} />
              </a>
              
              {org.phone !== "N/A" && (
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <Phone size={16} />
                  <span>{org.phone}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
