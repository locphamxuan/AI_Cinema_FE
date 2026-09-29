'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Sparkles, ChevronDown, User, LogOut, Wallet, Film, ShieldCheck, Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface NetflixNavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSearchChange?: (query: string) => void;
}

export default function NetflixNavbar({ activeTab, onSelectTab, onSearchChange }: NetflixNavbarProps) {
  const router = useRouter();
  const { user, isAuthenticated, wallet, openAuthModal, logout, openDepositModal } = useAppStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) onSearchChange(searchQuery);
  };

  const navLinks = [
    { id: 'kham-pha', label: 'Khám Phá' },
    { id: 'series-ai', label: 'Series AI' },
    { id: 'chieu-rap-ai', label: 'Phim Chiếu Rạp AI' },
    { id: 'the-loai', label: 'Thể Loại' },
    { id: 'bang-xep-hang', label: 'Bảng Xếp Hạng' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0A0C10]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5'
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-8 lg:gap-10">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E50914] to-red-800 flex items-center justify-center text-white font-black text-base shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              AI
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-wider text-white group-hover:text-[#E50914] transition-colors">
              CINEMA<span className="text-[#8B5CF6]">.</span>
            </span>
          </Link>

          {/* Navigation Category Items */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`text-sm font-medium transition-all relative py-1 cursor-pointer ${
                    isActive ? 'text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914] rounded-full shadow-[0_0_8px_#E50914]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Search, Notification, Wallet, User Account */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-black/70 border border-white/20 rounded-full px-3 py-1.5 backdrop-blur-md transition-all w-48 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  placeholder="Tìm phim, thể loại, studio..."
                  autoFocus
                  className="w-full bg-transparent text-xs text-white placeholder-slate-400 px-2 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    if (onSearchChange) onSearchChange('');
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Tìm kiếm phim"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Thông báo phim mới"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
          </button>

          {/* Coin Wallet Badge */}
          <button
            onClick={openDepositModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/30 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            title="Ví Coin - Bấm để nạp thêm"
          >
            <span className="text-sm">🪙</span>
            <span>{(wallet.mainCoin + wallet.bonusCoin).toLocaleString('vi-VN')}</span>
            <span className="text-[10px] text-[#8B5CF6] font-normal hidden sm:inline">Coin</span>
          </button>

          {/* User Account Menu or Login Button */}
          {isAuthenticated && user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-white/20 transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-pink-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-2xl bg-[#12151E] border border-white/10 shadow-2xl z-50 animate-fade-in text-xs">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 capitalize">{user.role || 'Hội viên'}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" /> Hồ sơ cá nhân
                    </Link>
                    <Link
                      href="/profile/transactions"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <Wallet className="w-3.5 h-3.5 text-amber-400" /> Lịch sử giao dịch
                    </Link>
                  </div>

                  {/* Operational Portals Quick Access */}
                  <div className="py-1 border-t border-white/5">
                    <p className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cổng điều hành</p>
                    <Link
                      href="/creator"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-400 hover:bg-purple-500/10 transition"
                    >
                      <Film className="w-3.5 h-3.5" /> Studio Maker Hub
                    </Link>
                    <Link
                      href="/reviewer"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Checker Audit Hub
                    </Link>
                    {(user.role === 'admin' || user.role === 'staff') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Settings className="w-3.5 h-3.5" /> Quản Trị Hệ Thống
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-white/5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 rounded-full bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Đăng Nhập
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
