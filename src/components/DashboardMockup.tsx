import { Facebook, Instagram, Youtube, Calendar, TrendingUp, Users, Clock } from "lucide-react";

const DashboardMockup = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Browser Chrome */}
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-t-xl p-3 flex items-center gap-2 border border-slate-700/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 bg-slate-700/50 rounded-md px-4 py-1.5 text-xs text-slate-400 text-center">
          socialflow.app/dashboard
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-b-xl border border-t-0 border-slate-700/50 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg">Your Social Dashboard</h3>
            <p className="text-slate-400 text-xs">Last updated: Today</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              S
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-xs">Scheduled</span>
            </div>
            <div className="text-xl font-bold text-white">12</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-slate-400 text-xs">Published</span>
            </div>
            <div className="text-xl font-bold text-white">48</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400 text-xs">Engagement</span>
            </div>
            <div className="text-xl font-bold text-white">2.4k</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span className="text-slate-400 text-xs">Growth</span>
            </div>
            <div className="text-xl font-bold text-white">+128</div>
          </div>
        </div>
        
        {/* Upcoming Posts */}
        <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
          <h4 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Upcoming Posts
          </h4>
          <div className="space-y-3">
            {/* Post 1 */}
            <div className="flex items-center gap-3 bg-slate-800/60 rounded-lg p-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Facebook className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Product Launch Announcement</p>
                <p className="text-slate-400 text-xs">Today, 5:00 PM</p>
              </div>
              <div className="px-2 py-1 bg-green-500/20 rounded text-green-400 text-xs">
                Ready
              </div>
            </div>
            
            {/* Post 2 */}
            <div className="flex items-center gap-3 bg-slate-800/60 rounded-lg p-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Instagram className="w-5 h-5 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Behind the Scenes</p>
                <p className="text-slate-400 text-xs">Tomorrow, 9:00 AM</p>
              </div>
              <div className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-400 text-xs">
                Draft
              </div>
            </div>
            
            {/* Post 3 */}
            <div className="flex items-center gap-3 bg-slate-800/60 rounded-lg p-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Youtube className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Weekly Tutorial Video</p>
                <p className="text-slate-400 text-xs">Dec 7, 2:00 PM</p>
              </div>
              <div className="px-2 py-1 bg-cyan-500/20 rounded text-cyan-400 text-xs">
                Scheduled
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-cyan-500/20 blur-3xl rounded-full" />
    </div>
  );
};

export default DashboardMockup;
