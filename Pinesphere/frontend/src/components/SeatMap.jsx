import { useState } from "react";
export default function SeatMap({ rows, seatsPerRow, bookedSeats, lockedSeats, selectedSeats, onToggleSeat, price }) {
  const bookedSet = new Set(bookedSeats);
  const lockedSet = new Set(lockedSeats);
  const selectedSet = new Set(selectedSeats);

  const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-lg">
        <div className="mx-8 h-2 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 rounded-t-full" />
        <p className="text-center text-xs text-gray-400 mt-1 tracking-widest uppercase">Screen this way</p>
      </div>

      <div className="flex flex-col gap-1.5">
        {rowLabels.map((rowLetter) => (
          <div key={rowLetter} className="flex items-center gap-1.5">
            <span className="w-6 text-center text-xs font-semibold text-gray-400">{rowLetter}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: seatsPerRow }, (_, seatIdx) => {
                const seatNum = seatIdx + 1;
                const seatLabel = `${rowLetter}${seatNum}`;
                const isBooked = bookedSet.has(seatLabel);
                const isLocked = lockedSet.has(seatLabel);
                const isSelected = selectedSet.has(seatLabel);

                let bgClass = "bg-white border-2 border-green-400 text-green-700 hover:bg-green-50 cursor-pointer";
                if (isBooked) bgClass = "bg-gray-300 border-2 border-gray-300 text-gray-500 cursor-not-allowed";
                else if (isLocked) bgClass = "bg-yellow-100 border-2 border-yellow-400 text-yellow-600 cursor-not-allowed";
                else if (isSelected) bgClass = "bg-green-500 border-2 border-green-600 text-white cursor-pointer shadow-md";

                return (
                  <button
                    key={seatLabel}
                    disabled={isBooked || isLocked}
                    onClick={() => onToggleSeat(seatLabel)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-t-lg text-[10px] sm:text-xs font-medium transition-all ${bgClass}`}
                    title={
                      isBooked ? `${seatLabel} - Booked` :
                      isLocked ? `${seatLabel} - Locked` :
                      isSelected ? `${seatLabel} - Selected` :
                      `${seatLabel} - Available`
                    }
                  >
                    {seatNum}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-center text-xs font-semibold text-gray-400">{rowLetter}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-t-md bg-white border-2 border-green-400" />
          <span className="text-xs text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-t-md bg-green-500 border-2 border-green-600" />
          <span className="text-xs text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-t-md bg-gray-300 border-2 border-gray-300" />
          <span className="text-xs text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-t-md bg-yellow-100 border-2 border-yellow-400" />
          <span className="text-xs text-gray-600">Locked</span>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 w-full max-w-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-green-700">{selectedSeats.length}</span> seat{selectedSeats.length > 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{selectedSeats.join(", ")}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-700">₹{(selectedSeats.length * price).toFixed(0)}</p>
              <p className="text-xs text-gray-500">₹{price} × {selectedSeats.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
