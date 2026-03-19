import React from 'react';

/**
 * A simple footer.
 */
export default function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Consti-Connect. A Full-Stack Portfolio Project.</p>
      </div>
    </footer>
  );
}

