"use client";

type PrintButtonProps = {
  label?: string;
};

export default function PrintButton({
  label = "Print",
}: PrintButtonProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="wl-print-button"
      aria-label={label}
    >
      <span aria-hidden="true">🖨</span>
      {label}

      <style jsx>{`
        .wl-print-button {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 16px;
          border: 1px solid #d7e2d6;
          border-radius: 10px;
          background: #ffffff;
          color: #23633d;
          font-family: inherit;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          transition:
            background 150ms ease,
            border-color 150ms ease,
            transform 150ms ease;
        }

        .wl-print-button:hover {
          transform: translateY(-1px);
          border-color: #9db8a2;
          background: #f5f9f3;
        }

        @media print {
          .wl-print-button {
            display: none !important;
          }
        }
      `}</style>
    </button>
  );
}