"use client"
import React, { useMemo } from 'react'
import dynamic from "next/dynamic";
import { UserAuth } from '@/context/AuthContext';

const ProjectsPage = ({ params }: { params: { id: string } }) => {
  const { user } = UserAuth();
  const id = params.id
  const userId = user?.uid
  const Editor = useMemo(
    () => dynamic(() => import('@/components/Editor'), { ssr: false }), []
  )
  if (!userId) return;
  return (
    <div className='w-full'>
      <Editor noteId={id as string} userId={userId} />
    </div>
  )
}

export default ProjectsPage