import React from 'react';
import { GraduationCap, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Campus<span className="text-brand-400">Geeks</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The verified peer-to-peer resource sharing platform built by students, for students.
              Borrow semester gear, save thousands, and build campus sustainability together.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus ID & WhatsApp Verified Handoffs</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore?category=Electronics+%26+Kits" className="hover:text-white transition-colors">
                  Electronics & Arduino Kits
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Lab+Gear" className="hover:text-white transition-colors">
                  Lab Coats & Safety Gear
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Textbooks" className="hover:text-white transition-colors">
                  Semester Textbooks & Notes
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Drafting+%26+Tools" className="hover:text-white transition-colors">
                  Engineering Drafters & Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Student Integrity
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every borrow request tracks item condition and return dates. Treat your peers' gear
              with care and maintain a 5-star trust score.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} CampusGeeks. Built with MERN Stack for Campus Innovation.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for university engineers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
