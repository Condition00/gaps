'use client';

import React from 'react';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

import useScroll from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';
import { UserAuth } from '@/context/AuthContext';
import Image from 'next/image';

const Header = () => {
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();
  const { user, googleSignIn, logOut } = UserAuth()
  const handleSignIn = async () => {
    try {
      await googleSignIn()
    } catch (err) {
      console.log(err)
    }
  }
  const handleSignOut = async () => {
    try {
      await logOut()
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 w-full transition-all border-b border-gray-200`,
        {
          'border-b border-gray-200 bg-white/75 backdrop-blur-lg': scrolled,
          'border-b border-gray-200 bg-white': selectedLayout,
        },
      )}
    >
      <div className="flex h-[47px] items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex flex-row space-x-3 items-center justify-center md:hidden"
          >
            <span className="h-7 w-7 bg-zinc-300 rounded-lg" />
            <span className="font-bold text-xl flex ">GAPS</span>
          </Link>
        </div>

        <div className="hidden md:block">
          <div className=" rounded-full  flex items-center justify-center text-center">
            {!user ? (
              <span onClick={handleSignIn} className="font-semibold text-sm cursor-pointer">SignIn</span>
            ) : (
              <div className='gap-3 flex items-center justify-center'>
                <span onClick={handleSignOut} className="font-semibold text-red-500 text-sm cursor-pointer">Logout</span>
                <Image className='rounded-full' src={user.photoURL || ""} height={30} width={30} alt='logo' />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;