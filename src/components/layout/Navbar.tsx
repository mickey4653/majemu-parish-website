'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IoClose } from 'react-icons/io5';
import { RiMenu3Line } from 'react-icons/ri';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Sermon', href: '/all-sermons' },
    { name: 'About', href: '/about' },
    { name: 'Events', href: '/events' },
    { name: 'Community', href: '/community' },
  ];

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/celelogo.svg"
                alt="Majemu Logo"
                width={50}
                height={50}
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Right side: Navigation Links + Donate Button */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-text-primary font-medium relative py-2 px-6
                  ${link.name === 'Home' 
                    ? 'border-b-2 border-secondary-main' 
                    : 'hover:border-b-2 hover:border-secondary-main transition-all duration-200'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/donate"
              className="ml-6 bg-secondary-main text-text-primary px-6 py-2 rounded-button hover:bg-secondary-dark transition duration-200 font-semibold"
            >
              DONATE
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center space-x-8 lg:hidden">
            <Link
              href="/donate"
              className="bg-secondary-main text-text-primary px-4 py-2 rounded-button text-sm hover:bg-secondary-dark transition duration-200 font-semibold"
            >
              DONATE
            </Link>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-text-secondary hover:text-text-primary focus:outline-none"
              aria-label="Open menu"
              title="Open menu"
            >
              <RiMenu3Line className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Menu Content */}
          <div 
            className={`fixed inset-y-0 right-0 w-full md:w-[80%] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/images/celelogo.svg"
                    alt="Majemu Logo"
                    width={40}
                    height={40}
                    className="h-10 w-auto"
                  />
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-text-secondary hover:text-text-primary focus:outline-none"
                  aria-label="Close menu"
                  title="Close menu"
                >
                  <IoClose className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-3 px-4 text-text-primary font-medium text-lg
                      ${link.name === 'Home'
                        ? 'bg-primary-main text-white rounded-button' 
                        : 'hover:border-b-2 hover:border-secondary-main transition-all duration-200'
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  href="/donate"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-4 bg-secondary-main text-text-primary px-4 py-3 rounded-button text-center hover:bg-secondary-dark transition duration-200 font-semibold"
                >
                  DONATE
                </Link>
              </div>
            </div>
          </div>
          {/* Dark Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        </>
      )}
    </header>
  );
} 