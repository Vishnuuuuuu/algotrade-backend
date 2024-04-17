import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const SOCKET_IO_URL = "https://nasal-accidental-nutmeg.glitch.me";
const socket = io(SOCKET_IO_URL);

function App() {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    socket.on('trading-signal', (signal) => {
      // Format the date and time from the timestamp
      const dateTime = new Date(signal.date);
      const formattedDate = dateTime.toLocaleDateString();
      const formattedTime = dateTime.toLocaleTimeString();

      // Determine the signal based on the candle color
      const tradeSignal = signal.color === 'green' ? 'Buy' : signal.color === 'red' ? 'Sell' : 'N/A';
      
      // Add a serial number to each signal based on its index and include the trade signal
      setSignals(prevSignals => [...prevSignals, {
        ...signal,
        date: formattedDate,
        time: formattedTime,
        tradeSignal,
        slNo: prevSignals.length + 1
      }]);
    });

    // Cleanup on component unmount
    return () => socket.off('trading-signal');
  }, []);

  return (
    <div className="App">
      <h2>Trading Signals</h2>
      <table>
        <thead>
          <tr>
            <th>Sl. No</th>
            <th>Date</th>
            <th>Time</th>
            <th>Ticker</th>
            <th>Interval</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Close</th>
            <th>Color</th>
            <th>Signal</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((signal, index) => (
            <tr key={index}>
              <td>{signal.slNo}</td>
              <td>{signal.date}</td>
              <td>{signal.time}</td>
              <td>{signal.ticker || 'N/A'}</td>
              <td>{signal.interval || 'N/A'}</td>
              <td>{signal.open || 'N/A'}</td>
              <td>{signal.high || 'N/A'}</td>
              <td>{signal.low || 'N/A'}</td>
              <td>{signal.close || 'N/A'}</td>
              <td>{signal.color || 'N/A'}</td>
              <td>{signal.tradeSignal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
