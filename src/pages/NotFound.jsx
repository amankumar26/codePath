import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-950 p-6">
      <div className="block-panel max-w-md w-full p-8 text-center relative shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-dark-800 border-4 border-black text-slate-400 mb-6">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white uppercase text-shadow-retro">404</h1>
        <h2 className="text-xs font-retro text-slate-300 mt-3 uppercase tracking-wide">Block Not Found</h2>
        <p className="text-slate-400 font-retro text-lg mt-4 leading-relaxed">
          The challenge page or block you are searching for does not exist in the world registry. Let's respawn you back at spawn!
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="mine-btn mine-btn-green w-full uppercase"
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Spawn</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
