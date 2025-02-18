import React, { useEffect } from 'react';
import ClipboardJS from 'clipboard';

type ClipboardButtonProps = {
  text: string;
};

const ClipboardButton: React.FC<ClipboardButtonProps> = ({ text }) => {
  useEffect(() => {
    // Initialize Clipboard.js
    const clipboard = new ClipboardJS('.js-clipboard-example');

    // Handle success event
    clipboard.on('success', (e) => {
      e.clearSelection();
      const successIcon = e.trigger.querySelector('.js-clipboard-success');
      const defaultIcon = e.trigger.querySelector('.js-clipboard-default');

      if (successIcon && defaultIcon) {
        successIcon.classList.remove('hidden');
        defaultIcon.classList.add('hidden');

        // Revert back to the default icon after 2 seconds
        setTimeout(() => {
          successIcon.classList.add('hidden');
          defaultIcon.classList.remove('hidden');
        }, 2000);
      }
    });

    // Cleanup on unmount
    return () => {
      clipboard.destroy();
    };
  }, []);

  return (
    <div className="px-6 py-3">
      <div className="inline-flex items-center gap-x-3">
        

        <button
          type="button"
          className="js-clipboard-example p-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
          data-clipboard-text={text}
          data-clipboard-action="copy"
        >
          <svg
            className="js-clipboard-default size-4 group-hover:rotate-6 transition"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          </svg>

          <svg
            className="js-clipboard-success hidden size-4 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <div id="hs-clipboard-basic" className="text-sm font-medium text-gray-800">
          {text}
        </div>
      </div>
    </div>
  );
};

export default ClipboardButton;