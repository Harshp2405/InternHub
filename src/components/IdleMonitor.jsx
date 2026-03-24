"use client"
import React from 'react'
import { useIdleTimeout } from '../hooks/useIdleTimeout';

const IdleMonitor = () => {
    const isIdle = useIdleTimeout(15000);
  return (
		<div>
			{isIdle && (
				<div className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
					<div className="bg-slate-800 border border-red-500 p-8 rounded-2xl shadow-2xl text-center max-w-sm">
						<div className="text-red-500 text-5xl mb-4">⚠️</div>
						<h2 className="text-xl font-bold text-white mb-2">
							Inactivity Detected
						</h2>
						<p className="text-slate-300 mb-6">
							It looks like the cursor isn&apos;t moving. Please move your mouse
							or press a key to continue.
						</p>
						<button
							onClick={() => window.location.reload()}
							className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all">
							Refresh Page
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default IdleMonitor